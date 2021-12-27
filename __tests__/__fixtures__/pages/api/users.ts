import { NextApiHandler } from "next";

export default interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

const handler: NextApiHandler<User[]> = (req, res) => {
  res.status(200).json([]);
};

export default handler;
