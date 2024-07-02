import axios from "axios";
import {NextApiRequest, NextApiResponse} from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const assembly = axios.create({
    baseURL: "https://api.assemblyai.com/v2",
    headers: {
      authorization: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY,
      "content-type": "application/json",
    },
  });

  try {
    const response = await assembly.get(`/transcript/${req.body.data.id}`);

    res.status(200).json(response.data);
  } catch (e) {
    console.log(e);
  }
};

export default handler;
