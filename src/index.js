const months = [
  "January",
  "February",
  "March",
  "April",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const challenge = document.querySelector(".challenge-date");
const deadline = document.querySelector(".deadline");
const items = document.querySelectorAll(".deadline-format h4");

const futureDate = new Date(2021, 9, 26, 23, 59, 59);
console.log(futureDate);

const year = futureDate.getFullYear();
const hours = futureDate.getHours();
const minutes = futureDate.getMinutes();
const month = months[futureDate.getMonth() - 1];
const date = futureDate.getDate();

challenge.textContent = `Challenge ends on ${date} ${month} ${year}, ${hours}:${minutes}`;

//future time in ms
const futureTime = futureDate.getTime();

function getRemainingTime() {
  const today = new Date();
  const difference = futureTime - today;
  // 1s is 1000ms
  // 1m is 60s
  // 1hr is 60m
  // 1d is 24hr

  //values in ms
  const oneDay = 24 * 60 * 60 * 1000;
  const oneHour = 60 * 60 * 1000;
  const oneMinute = 60 * 1000;
  // calculate all values
  const days = Math.floor(difference / oneDay);
  const hours = Math.floor((difference % oneDay) / oneHour);
  const minutes = Math.floor((difference % oneHour) / oneMinute);
  const seconds = Math.floor((difference % oneMinute) / 1000);

  //set values array
  const values = [days, hours, minutes, seconds];
  items.forEach(function (item, index) {
    item.innerHTML = values[index];
  });
}

setInterval(getRemainingTime, 1000);

const headers = {
  Authorization: "Basic " + btoa("SusieHatter"),
};

const getGithubCommits = async () =>
  fetch(`https://api.github.com/users/Susiehatter/repos?per_page=100`, {
    headers,
  })
    .then((res) => res.json())
    .then((repos) =>
      Promise.all(
        repos.map((repo) =>
          fetch(
            `https://api.github.com/repos/Susiehatter/${repo.name}/commits?author=SusieHatter&per_page=100&since=2021-07-19T05:00:00Z`,
            {
              headers,
            }
          ).then((res) => res.json())
        )
      )
    )
    .then((list) => list.flat());

const isDateOnDay = (dateTimeStr, dateStr) => {
  const dateTime = new Date(dateTimeStr);
  const date = new Date(dateStr);
  const dateTimeYear = dateTime.getFullYear();
  const dateTimeMonth = dateTime.getMonth();
  const dateTimeDay = dateTime.getDate();
  const dateYear = date.getFullYear();
  const dateMonth = date.getMonth();
  const dateDay = date.getDate();
  return (
    dateTimeYear === dateYear &&
    dateTimeMonth === dateMonth &&
    dateTimeDay === dateDay
  );
};

const getCommitsOnDay = (commits, date) => {
  return commits.filter((commit) =>
    isDateOnDay(commit.commit.author.date, date)
  );
};

function getCommitClass(numCommits) {
  if (numCommits >= 5) {
    return "plusultra-commits";
  } else if (numCommits >= 3) {
    return "superb-commits";
  } else if (numCommits >= 2) {
    return "regular-commits";
  } else if (numCommits >= 1) {
    return "few-commits";
  } else {
    return "no-commits";
  }
}

function createDayTile(commits) {
  const dayTile = document.createElement("div");
  dayTile.classList.add("day");
  console.log(commits);
  const commitClass = getCommitClass(commits.length);
  dayTile.classList.add(commitClass);
  return dayTile;
}

const NUM_DAYS = 100;
const START_DATE = new Date("2021-07-19T05:00:00Z");

const calendarEl = document.getElementById("calendar");

(async () => {
  const commits = await getGithubCommits();
  const date = START_DATE;
  for (let i = 0; i < NUM_DAYS; i++) {
    const commitsOnDay = getCommitsOnDay(commits, date);
    const dayTile = createDayTile(commitsOnDay);
    calendarEl.appendChild(dayTile);
    date.setDate(date.getDate() + 1);
  }
})();
