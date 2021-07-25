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
