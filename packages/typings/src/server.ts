import { IProcess } from "./process";

interface IServer {
  _id: string;
  name: string;
  uuid: string;
  heartbeat: number;
  createdAt?: string;
  updatedAt: string;
  processes: IProcess[];
  serverCpu?: number;
  serverRam?: number;
  serverUptime?: number;
}

type IServerModel = Omit<IServer, "processes" | "serverCpu" | "serverRam" | "serverUptime">;

export type { IServer, IProcess, IServerModel };
