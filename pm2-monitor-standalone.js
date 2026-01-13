const pm2 = require('pm2');
const mongoose = require('mongoose');
const si = require('systeminformation');
const bytes = require('bytes-iec');

/**
 * STANDALONE PM2 MONITOR PLUGIN
 * This script allows you to embed PM2 monitoring logic into any Node.js application.
 * Created by TT (Antigravity)
 */

// --- MONGOOSE MODELS ---
const serverSchema = new mongoose.Schema({
    name: String,
    uuid: { type: String, unique: true },
    heartbeat: { type: Date, default: Date.now }
});
const Server = mongoose.models.Server || mongoose.model("Server", serverSchema);

const processSchema = new mongoose.Schema({
    name: String,
    pm_id: Number,
    server: { type: mongoose.Schema.Types.ObjectId, ref: 'Server' },
    status: String,
    type: String,
    versioning: Object,
    logs: [Object],
    restartCount: { type: Number, default: 0 },
    toggleCount: { type: Number, default: 0 },
    deleteCount: { type: Number, default: 0 }
});
const Process = mongoose.models.Process || mongoose.model("Process", processSchema);

const statSchema = new mongoose.Schema({
    source: {
        server: { type: mongoose.Schema.Types.ObjectId, ref: 'Server' },
        process: { type: mongoose.Schema.Types.ObjectId, ref: 'Process' }
    },
    cpu: Number,
    memory: Number,
    memoryMax: Number,
    heapUsed: Number,
    uptime: Number,
    timestamp: { type: Date, default: Date.now }
});
const Stat = mongoose.models.Stat || mongoose.model("Stat", statSchema);

const settingSchema = new mongoose.Schema({
    polling: {
        backend: { type: Number, default: 3000 },
        frontend: { type: Number, default: 3000 }
    },
    logRotation: { type: Number, default: 100 }
});
const Setting = mongoose.models.Setting || mongoose.model("Setting", settingSchema);

// --- LOG CAPTURE LOGIC ---
class LogCapture {
    constructor() {
        this.queuedLogs = [];
    }
    capture() {
        pm2.launchBus((err, bus) => {
            if (err) return;
            bus.on("log:err", (packet) => {
                this.queuedLogs.push({
                    id: packet.process.pm_id,
                    type: "error",
                    message: `[${packet.process.name}] ${packet.data}`.replace(/\n$/, ""),
                    createdAt: new Date()
                });
            });
            bus.on("log:out", (packet) => {
                this.queuedLogs.push({
                    id: packet.process.pm_id,
                    type: "success",
                    message: `[${packet.process.name}] ${packet.data}`.replace(/\n$/, ""),
                    createdAt: new Date()
                });
            });
        });
    }
    clear() {
        const logs = [...this.queuedLogs];
        this.queuedLogs = [];
        return logs;
    }
}

// --- MONITOR LOGIC ---
async function startMonitor({ dbUri, serverName }) {
    console.log("🚀 Starting Embedded PM2 Monitor...");

    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(dbUri);
        }
    } catch (err) {
        console.error("❌ Monitor DB Connection Error:", err.message);
        return;
    }

    const logCapture = new LogCapture();
    logCapture.capture();

    const updateLoop = async () => {
        try {
            const settings = await Setting.findOne() || { polling: { backend: 3000 }, logRotation: 100 };
            const mem = await si.mem();
            const os = await si.osInfo();
            const sys = await si.system();
            const load = await si.currentLoad();
            const time = await si.time();

            const sInfo = {
                name: serverName || os.hostname,
                uuid: sys.uuid || os.serial || "standalone-server",
                stats: {
                    cpu: load.currentLoad,
                    memory: mem.used,
                    memoryMax: mem.total,
                    uptime: time.uptime * 1000
                }
            };

            // Sync Server
            let currentServer = await Server.findOne({ uuid: sInfo.uuid });
            if (currentServer) {
                currentServer.name = sInfo.name;
                currentServer.heartbeat = Date.now();
                await currentServer.save();
            } else {
                currentServer = await Server.create({ name: sInfo.name, uuid: sInfo.uuid });
            }

            // Sync Processes
            pm2.list(async (err, list) => {
                if (err) return;

                const logs = logCapture.clear();
                const timestamp = new Date();
                const currentPmIds = list.map(p => p.pm_id);

                for (const item of list) {
                    const procLogs = logs.filter(l => l.id === item.pm_id).map(l => { delete l.id; return l; });
                    const usedHeap = item.pm2_env?.axm_monitor?.["Used Heap Size"];

                    const pData = {
                        name: item.name,
                        pm_id: item.pm_id,
                        status: item.pm2_env?.status,
                        versioning: item.pm2_env?.versioning,
                        type: item.pm2_env?.exec_interpreter === 'node' ? 'node' : 'other'
                    };

                    let dbProc = await Process.findOne({ pm_id: item.pm_id, server: currentServer._id });
                    if (dbProc) {
                        await Process.updateOne({ _id: dbProc._id }, {
                            name: pData.name,
                            status: pData.status,
                            versioning: pData.versioning,
                            $push: { logs: { $each: procLogs, $slice: -(settings.logRotation || 100) } }
                        });
                    } else {
                        dbProc = await Process.create({
                            ...pData,
                            server: currentServer._id,
                            logs: procLogs
                        });
                    }

                    // Save Stat
                    await Stat.create({
                        source: { server: currentServer._id, process: dbProc._id },
                        cpu: item.monit?.cpu || 0,
                        memory: item.monit?.memory || 0,
                        heapUsed: usedHeap ? bytes.parse(`${usedHeap.value}${usedHeap.unit}`) : 0,
                        memoryMax: mem.total,
                        uptime: Date.now() - (item.pm2_env?.pm_uptime || 0),
                        timestamp
                    });
                }

                // Server Global Stat
                await Stat.create({
                    source: { server: currentServer._id },
                    cpu: sInfo.stats.cpu,
                    memory: sInfo.stats.memory,
                    memoryMax: sInfo.stats.memoryMax,
                    uptime: sInfo.stats.uptime,
                    timestamp
                });

                // Clean up removed processes
                await Process.deleteMany({ server: currentServer._id, pm_id: { $nin: currentPmIds } });
            });

            setTimeout(updateLoop, settings.polling.backend || 3000);
        } catch (err) {
            console.error("❌ Monitor Loop Error:", err.message);
            setTimeout(updateLoop, 5000);
        }
    };

    // Listen for commands from Dashboard
    const watchChanges = () => {
        const pipeline = [{ $match: { 'operationType': 'update' } }];
        Process.watch(pipeline, { fullDocument: 'updateLookup' }).on('change', async (change) => {
            const doc = change.fullDocument;
            if (!doc || String(doc.server) !== String(currentServer._id)) return;

            const fields = change.updateDescription.updatedFields;
            if (fields.restartCount) {
                pm2.restart(doc.pm_id, () => { });
                await Process.updateOne({ _id: doc._id }, { $set: { restartCount: 0 } });
            } else if (fields.toggleCount) {
                if (doc.status === 'online') pm2.stop(doc.pm_id, () => { });
                else pm2.restart(doc.pm_id, () => { });
                await Process.updateOne({ _id: doc._id }, { $set: { toggleCount: 0 } });
            }
        });
    };

    // We need a small delay for currentServer to be ready
    setTimeout(() => {
        updateLoop();
        // watchChanges(); // Optional: Enable if you want to control from Dashboard
    }, 1000);
}

module.exports = { startMonitor };
