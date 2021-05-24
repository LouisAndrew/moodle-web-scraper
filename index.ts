import * as puppeteer from "puppeteer";

require("dotenv").config();

const signIn = async (page: puppeteer.Page) => {
  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;

  await page.type("#username", username);
  await page.type("#password", password);

  await page.click("#loginbtn");
};

const evaluatePage = async (page: puppeteer.Page) => {
  page.evaluate(() => {
    const courses = document.querySelectorAll(".coursebox");

    const coursesArr = Array.from(courses);

    const withEvent = coursesArr.filter(
      (el) => !!el.querySelector(".coc-coursenews")
    );

    withEvent.forEach((event) => {
      const courseTitle = event.querySelector("h3 a").textContent;
      const modules = event.querySelectorAll(".coc-module");
      const overviews = Array.from(modules).map((m) => {
        const getAssignment = (module: Element) => {
          const name = m.querySelector(".name").textContent;
          const info = m.querySelector(".info").textContent;

          return { name, info };
        };

        const overviewText = m.querySelector(".overview").textContent;
        const assignments = Array.from(
          m.querySelectorAll(".assign.overview")
        ).map((a) => getAssignment(a));

        return { overviewText, assignments };
      });

      console.log(JSON.stringify({ courseTitle, overviews }, null, 2));
    });
  });
};

(async () => {
  const URL = "https://moodle.htw-berlin.de/my/";

  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  page.on("console", (msg) => {
    for (let i = 0; i < msg.args().length; ++i)
      console.log(`${i}: ${msg.args()[i]}`);
  });

  await page.goto(URL, { waitUntil: "networkidle2" });

  await signIn(page);
  await page.waitForTimeout(2000);
  await evaluatePage(page);

  await browser.close();
})();
