export interface Permission {
  id?: string;
  name: string;
  description?: string;
  module: string;
  action: string;
  resource: string;
  createdAt?: Date;
  updatedAt?: Date;
}