const CACHED_COMMITS_KEY = "cached-commits";
const CACHE_MILLIS = 60000; // 1 minute
const API_BASE_URL = "https://pandora.susie.mx"; // "http://localhost:8080";

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

const year = futureDate.getFullYear();
const hours = futureDate.getHours();
const minutes = futureDate.getMinutes();
const month = months[futureDate.getMonth() - 1];
const date = futureDate.getDate();

challenge.textContent = `Challenge ended on ${date} ${month} ${year}, ${hours}:${minutes}`;

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

// getRemainingTime();
// setInterval(getRemainingTime, 1000);

const getGitHubRepos = () =>
  fetch(`${API_BASE_URL}/github/repos`).then((res) => res.json());

const getRepoCommits = (repo) =>
  fetch(`${API_BASE_URL}/github/repos/${repo.name}/commits`)
    .then((res) => res.json())
    .then((commits) =>
      commits.map((commit) => ({
        ...commit,
        repo,
      }))
    );

const createCacheFn = (fn, key, cache_time) => async () => {
  const now = Date.now();
  const cacheStr = localStorage.getItem(key);
  if (cacheStr !== null) {
    const cache = JSON.parse(cacheStr);
    if (cache.time + cache_time > now) {
      return cache.data;
    }
  }
  const data = await fn();
  localStorage.setItem(
    key,
    JSON.stringify({
      time: now,
      data,
    })
  );
  return data;
};

const getGithubCommits = async () => {
  const repos = await getGitHubRepos();
  const reposCommits = await Promise.all(
    repos.map((repo) => getRepoCommits(repo))
  );
  return reposCommits.flat();
};

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
  const commitClass = getCommitClass(commits.length);
  dayTile.classList.add(commitClass);
  return dayTile;
}

const emojis = [
  "😀",
  "💪",
  "😋",
  "💃",
  "💁‍♀️",
  "🤓",
  "😍",
  "💜",
  "😊",
  "✅",
  "🎉",
  "🎊",
  "💻",
];
const getRandEmoji = () => {
  return emojis[Math.floor(Math.random() * emojis.length)];
};

const commitsListHtml = (commits) => `
  <div class="commit-list">
    ${
      commits.length === 0
        ? "No commmits on this day 😢"
        : commits
            .map(
              (commit) => `
                <div class="commit row">
                  <div class="col">
                    <small>${commit.commit.author.date}</small>
                  </div>
                  <div class="col">
                    <div class="row">
                      <div class="col">
                        <h4>
                          <a
                            href="${commit.repo.html_url}"
                            class="rainbow-text"
                          >
                            ${commit.repo.name}
                          </a>
                        </h4>
                      </div>
                      <div class="col">
                        <a href="${commit.html_url}" class="rainbow-text">
                          ${commit.commit.message} ${getRandEmoji()}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              `
            )
            .join("\n")
    }
  </div>
`;

const NUM_DAYS = 100;
const START_DATE = new Date("2021-07-19T05:00:00Z");

const calendarEl = document.getElementById("calendar");
const modalEl = document.getElementById("modal");
const modalDateEl = document.getElementById("modal-date");
const closeButtonEl = document.getElementsByClassName("close")[0];
const commitsEl = document.getElementById("commits");

const getCachedGitHubCommits = createCacheFn(
  getGithubCommits,
  CACHED_COMMITS_KEY,
  CACHE_MILLIS
);

(async () => {
  const commits = await getCachedGitHubCommits();
  const date = START_DATE;
  for (let i = 0; i < NUM_DAYS; i++) {
    const commitsOnDay = getCommitsOnDay(commits, date);
    const dayTile = createDayTile(commitsOnDay);
    dayTile.onclick = () => {
      modalDateEl.innerHTML = date;
      modalEl.style.display = "block";
      commitsEl.innerHTML = commitsListHtml(commitsOnDay);
    };
    calendarEl.appendChild(dayTile);
    date.setDate(date.getDate() + 1);
  }
})();

closeButtonEl.onclick = function () {
  modalEl.style.display = "none";
};

window.onclick = function (event) {
  if (event.target === modalEl) {
    modalEl.style.display = "none";
  }
};
