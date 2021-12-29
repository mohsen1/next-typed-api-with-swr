import { NextApiHandler } from "next";

export default interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

const handler: NextApiHandler<User> = (req, res) => {
  res.status(200).json({
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    isAdmin: true,
  });
};

export default handler;
