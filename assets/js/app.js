"use strict";

import { fetchData } from "./api.js";

const addEventOnElements = function ($elements, eventType, callback) {
  for (const $element of $elements) {
    $element.addEventListener(eventType, callback);
  }
}

// header scroll state

const $header = document.querySelector("[data-header]");

window.addEventListener("scroll", function () {
  $header.classList[this.window.scrollY > 50 ? "add" : "remove"]("active");
});

// search toggle

const $searchToggler = document.querySelector("[data-search-toggler]");
const $searchField = document.querySelector("[data-search-field]");
let isExpanded = false;

$searchToggler.addEventListener("click", function () {
  $header.classList.toggle("search-active");
  isExpanded = isExpanded ? false : true;
  this.setAttribute("aria-expanded", isExpanded);
  $searchField.focus();
});

// tab navigation 

const $tabBtns = document.querySelectorAll("[data-tab-btn]");
const $tabPanels = document.querySelectorAll("[data-tab-panel]");
let [$lastActiveTabBtn] = $tabBtns;
let [$lastActiveTabPanel] = $tabPanels;

addEventOnElements($tabBtns, "click", function () {
  $lastActiveTabBtn.setAttribute("aria-selected", "false");
  $lastActiveTabPanel.setAttribute("hidden", "");

  this.setAttribute("aria-selected", "true");
  const $currentTabPanel = document.querySelector(`#${this.getAttribute("aria-controls")}`);
  $currentTabPanel.removeAttribute("hidden");

  $lastActiveTabBtn = this;
  $lastActiveTabPanel = $currentTabPanel;
});

// keyboard accessibility for tab buttons

addEventOnElements($tabBtns, "keydown", function (e) {
  const $nextElement = this.nextElementSibling;
  const $previousElement = this.previousElementSibling;

  if (e.key === "ArrowRight" && $nextElement) {
    this.setAttribute("tabindex", "-1");
    $nextElement.setAttribute("tabindex", "0");
    $nextElement.focus();
  } else if (e.key === "ArrowLeft" && $previousElement) {
    this.setAttribute("tabindex", "-1");
    $previousElement.setAttribute("tabindex", "0");
    $previousElement.focus();
  }
});

// work with API 

// Search

const $searchSubmit = document.querySelector("[data-search-submit]");
let apiURl = "https://api.github.com/users/Cristianmtz-lab";
let repoUrl, followerUrl, followingUrl = "";

const searchUser = function () {
  if (!$searchField.value) return;

  apiURl = `https://api.github.com/users/${$searchField.value}`;
  updateProfile(apiURl);
};

$searchSubmit.addEventListener("click", searchUser);

// searc when press Enter key 
$searchField.addEventListener("keydown", e => {
  if (e.key === "Enter") searchUser();
});

// profile 

const $profileCard = document.querySelector("[data-profile-card]");
const $repoPanel = document.querySelector("[data-repo-panel]");
const $error = document.querySelector("[data-error]");

window.updateProfile = function (profileUrl) {
  $error.style.display = "none";
  document.body.style.overflowY = "visible";

  $profileCard.innerHTML = `
    <div class="profile-skeleton">
      <div class="skeleton avatar-skeleton"></div>
      <div class="skeleton title-skeleton"></div>
      <div class="skeleton text-skeleton text-1"></div>
      <div class="skeleton text-skeleton text-2"></div>
      <div class="skeleton text-skeleton text-3"></div>
    </div>
  `;

  $tabBtns[0].click();

  $repoPanel.innerHTML = `
    <div class="card repo-skeleton">
      <div class="card-body">
        <div class="skeleton title-skeleton"></div>
        <div class="skeleton text-skeleton text-1"></div>
        <div class="skeleton text-skeleton text-2"></div>
      </div>

      <div class="card-footer">
        <div class="skeleton text-skeleton"></div>
        <div class="skeleton text-skeleton"></div>
        <div class="skeleton text-skeleton"></div>
      </div>
    </div>
  `.repeat(6);

  fetchData(profileUrl, data => {

    console.log(data)

    const {
      type,
      avatar_url,
      name,
      login: username,
      html_url: githubPage,
      bio,
      location,
      company,
      blog: website,
      twitter_repos,
      followers,
      following,
      followers_url,
      following_url,
      repos_url,
      public_repos
    } = data;

    repoUrl = repos_url;
    followerUrl = followers_url;
    followingUrl = following_url.replace("{/other_user}", "");

    $profileCard.innerHTML = `
      <figure class="${type === "User" ? "avatar-circle" : "avatar-rounded"} img-holder" style="--width: 280; --height: 280">
        <img src="${avatar_url}" alt="${username}" width="280" height="280"  class="img-cover">
      </figure>

      ${name ? `<h1 class="title-2">${name}</h1>` : ""}

      <p class="username text-primary">${username}</p>

      ${bio ? `<p class="bio">${bio}</p>` : ""}
      <a href="${githubPage}" target="_blank" class="btn btn-secondary">
        <span class="material-symbols-outlined" aria-hidden="true">open_in_new</span>
        <span class="span">See on GitHub</span>
      </a>

      <ul class="profile-meta">
      ${company ?
        `<li class="meta-item">
          <span class="material-symbols-outlined" aria-hidden="true">apartment</span>
          <span class="meta-text">${company}</span>
        </li>` : ""
      }
      ${location ?
        `<li class="meta-item">
            <span class="material-symbols-outlined" aria-hidden="true">location_on</span>
            <span class="meta-text">${location}</span>
          </li>` : ""
      }
      ${website ?
        `<li class="meta-item">
          <span class="material-symbols-outlined" aria-hidden="true">captive_portal</span>
          <a href="${website}" target="_blank" class="meta-text">${website.replace("https://", "")}</a>
        </li>` : ""
      }
      </ul>

      <ul class="profile-stats">
        <li class="stats-item">
          <span class="body">${public_repos}</span>Repos
        </li>
        <li class="stats-item">
          <span class="body">${followers}</span>Followers
        </li>
        <li class="stats-item">
          <span class="body">${following}</span>Following
        </li>
      </ul>

      <div class="footer">
        <p class="copyright">&copy; 2025 CristinMtzLab</p>
      </div>
    `;
  }, () => {
    $error.style.display = "grid";
    document.body.style.overflowY = "hidden";

    $error.innerHTML = `
      <p class="title-1">Oops! :(</p>
      <p class="text">
        There is no account with this username yet.
      </p>
    `;
  });

}

updateProfile(apiURl);