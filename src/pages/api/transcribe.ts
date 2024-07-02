import {NextApiRequest, NextApiResponse} from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const assembly = axios.create({
    baseURL: "https://api.assemblyai.com/v2",
    headers: {
      authorization: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY,
      "content-type": "application/json",
    },
  });

  try {
    const options =
      req.body.data.lang != "none"
        ? {
            audio_url: req.body.data.url,
            speaker_labels: true,
            language_code: req.body.data.lang,
          }
        : {
            audio_url: req.body.data.url,
            language_detection: true,
            speaker_labels: true,
          };

    const response = await assembly.post("/transcript", options);

    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
  }
}
