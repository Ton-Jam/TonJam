import React from "react";
import "./RecentlyAddedSection.css";
import TrackCardVertical from "../components/TrackCardVertical";

const recentlyAddedSongs = [
  {
    title: "Storms",
    artist: "Brizy",
    image: "/brizy.png",
  },
  {
    title: "Plans",
    artist: "Drakee",
    image: "/drake.png",
  },
  {
    title: "Stay safe",
    artist: "Jaycolee",
    image: "/jcole.png",
  },
  {
    title: "Everything dey",
    artist: "Daviido",
    image: "/davido.png",
  },
];

const RecentlyAddedSection = () => {
  return (
    <section className="recently-added-section">
      <h3>Recently Added</h3>
      {recentlyAddedSongs.map((song, index) => (
        <TrackCardVertical key={index} {...song} />
      ))}
    </section>
  );
};

export default RecentlyAddedSection;
