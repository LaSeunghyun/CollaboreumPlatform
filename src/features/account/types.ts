export type UserProfile = {
  avatar?: string;
  name?: string;
  email?: string;
  followers?: number;
  following?: number;
};

export type UserProjects = {
  data?: {
    projects?: Array<any>;
  };
  projects?: Array<any>;
};

export type UserBackings = {
  data?: {
    backings?: Array<any>;
  };
  backings?: Array<any>;
};
