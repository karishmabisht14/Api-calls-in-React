import React, { useState } from "react";

import MoviesList from "./components/MoviesList";
import "./App.css";

function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  
  async function retryFetch() {
      const id = setInterval(async () => {
      console.log("Retring in 5 seconds.....");
      setIsLoading(true);
      const response = await fetch("https://swapi.dev/api/film/");
      if (!response.ok) {
        clearInterval(id);        
        retryFetch();
      } else {
        clearInterval(id);
        return response;
      }      
    }, 5000);
    setIntervalId(id);
  }
  
  const cancelRequestHandler = () => {
    console.log("stop retrying");
    clearInterval(intervalId);
    setIsLoading(false);
    setError(null);
  }

  async function fetchMoviesHandler() {
    setIsLoading(true);
    setError(null);
    try {
      let response = await fetch("https://swapi.dev/api/film/");
      if (!response.ok) {
        response = await retryFetch();
        throw new Error('Some went Wrong...Retrying');
      } else {
        const data = await response.json();
        const transformedMovies = data.results.map((movieData) => {
          return {
            id: movieData.episode_id,
            title: movieData.title,
            openingText: movieData.opening_crawl,
            releaseDate: movieData.release_date,
          };
        });
        setMovies(transformedMovies);
      }
    } catch (error) {
      setError(error.message);
    }
    setIsLoading(false);
  }

  return (
    <React.Fragment>
      <section>  
        <button onClick={fetchMoviesHandler}>Fetch Movies</button>
        <button onClick={cancelRequestHandler}>cancel request</button>
      </section>
      <section>
        {!isLoading && movies.length > 0 && <MoviesList movies={movies} />}
        {!isLoading && movies.length === 0 && !error && <p>Found no movies.</p>}
        {!isLoading && error && <p>{error}</p>}
        {isLoading && (
          <button className="buttonload">
            <i className="fa fa-refresh fa-spin"></i>Loading
          </button>
        )}
      </section>
    </React.Fragment>
  );
}

export default App;
