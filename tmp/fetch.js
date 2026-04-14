async function fetchImage() {
  const res = await fetch('https://postimg.cc/gwf6xTTn');
  const text = await res.text();
  const match = text.match(/https:\/\/i\.postimg\.cc\/[^"']+/g);
  console.log(match);
}
fetchImage();
