type ISetting = {
  _id: string;
  polling: {
    backend: number;
    frontend: number;
  };
  logRotation: number;
  logRetention: number;
  excludeDaemon: boolean;
  showcaseMode: boolean;
  registrationCode: string;
  processPin?: string; // PIN for guest access to /process page
  createdAt: string;
  updatedAt: string;
};

type ISettingModel = ISetting;

export type { ISetting, ISettingModel };
