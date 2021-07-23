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
            `https://api.github.com/repos/Susiehatter/${repo.name}/commits?author=SusieHatter`,
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

const NUM_DAYS = 100;
const START_DATE = new Date("2021-07-19T05:00:00Z");

const calendarEl = document.getElementById("calendar");
const commits = await getGithubCommits();
console.log(commits);

const date = START_DATE;
for (let i = 0; i < NUM_DAYS; i++) {
  const child = document.createElement("div");
  child.classList.add("day");
  if (getCommitsOnDay(commits, date).length > 0) {
    child.classList.add("committed");
  }
  calendarEl.appendChild(child);
  date.setDate(date.getDate() + 1);
}
