import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import puppeteer from "puppeteer";
const app = express();
const port = process.env.PORT || 3001;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(
  cors({
    origin: "*",
  })
);

app.get("/", function (req, res) {
  res.json({
    message: "Hello World!",
  });
});

app.get("/googleSearch", async (req, res) => {
  try {
    const { q } = req.query;

    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();
    await page.goto(`https://www.google.com/search?q=${q}`);

    const result = await page.evaluate(() => {
      const results: {
        title: string;
        description: string;
        link: string;
      }[] = [];
      const items = document.querySelectorAll(".MjjYud");
      items.forEach((item) => {
        const link = item.querySelector("a");
        const title = link?.querySelector("h3")?.innerText;
        //@ts-ignore
        const description = item.querySelector(".lEBKkf")?.innerText;

        if (title) {
          results.push({
            title,
            description,
            link: link.href,
          });
        }
      });

      return results;
    });

    await browser.close();

    res.status(200).json(result);
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "Something went wrong",
      error: e,
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
