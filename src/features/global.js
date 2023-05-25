import { readJSON, writeJSON } from "../utils.js";

export async function addLinkInNavbar(dataToAdd) {
  const data = await readJSON("src/data/header.json");
  const navlinks = data.navlinks;
  navlinks.unshift(dataToAdd);
  await writeJSON("src/data/header.json", data);
  return data;
}
export async function editLinkInNavbar(jsonData) {
  const data = await readJSON("src/data/header.json");
  const dataNavbar = data.navlinks;

  for (let i = 0; i < dataNavbar.length; i++) {
    dataNavbar[i].title = jsonData[`title_${i}`];
    dataNavbar[i].href = jsonData[`href_${i}`];
  }

  await writeJSON("src/data/header.json", data);
  return data;
}

export async function deleteLinkInNavbar(indexToDelete) {
  const data = await readJSON("src/data/header.json");
  const navlinks = data.navlinks;
  navlinks.splice(indexToDelete, 1);

  await writeJSON("src/data/header.json", data);
  return data;
}

export async function addLinkInFooter(dataToAdd) {
  const data = await readJSON("src/data/footer.json");
  const footerLinks = data.footerLinks;
  footerLinks.unshift(dataToAdd);
  await writeJSON("src/data/footer.json", data);
  return data;
}

export async function deleteLinkInFooter(indexToDelete) {
  const data = await readJSON("src/data/footer.json");
  const footerLinks = data.footerLinks;
  footerLinks.splice(indexToDelete, 1);

  await writeJSON("src/data/footer.json", data);
  return data;
}

export async function editLinkInFooter(jsonData) {
  const data = await readJSON("src/data/footer.json");
  const footerLinks = data.footerLinks;

  for (let i = 0; i < footerLinks.length; i++) {
    footerLinks[i].title = jsonData[`title_${i}`];
    footerLinks[i].href = jsonData[`href_${i}`];
  }

  await writeJSON("src/data/footer.json", data);
  return data;
}

export async function editSocialMediaInFooter(jsonData) {
  const data = await readJSON("src/data/footer.json");
  const footerSocialMedia = data.footerSocialMedia;

  for (let i = 0; i < footerSocialMedia.length; i++) {
    footerSocialMedia[i].href = jsonData[`href_${i}`];
  }

  await writeJSON("src/data/footer.json", data);
  return data;
}
