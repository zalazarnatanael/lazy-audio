import multiparty from "multiparty";
import axios from "axios";
import fs from "fs-extra";
import {NextApiRequest, NextApiResponse} from "next";

const parseForm = (req: NextApiRequest): Promise<{fields: any; files: any}> => {
  return new Promise((resolve, reject) => {
    const form = new multiparty.Form();

    form.parse(req, (error, fields, files) => {
      if (error) {
        reject(error);
      } else {
        resolve({fields, files});
      }
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const assembly = axios.create({
    baseURL: "https://api.assemblyai.com/v2",
    headers: {
      authorization: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY,
      "content-type": "application/json",
      "transfer-encoding": "chunked",
    },
  });

  try {
    const {files} = await parseForm(req);

    const file = await fs.readFile(files.data[0].path);

    const response = await assembly.post("/upload", file);

    res.status(200).json(response.data);
  } catch (e) {
    console.log(e);
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
