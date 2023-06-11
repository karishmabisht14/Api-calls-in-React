import React, { useCallback, useEffect, useState } from "react";

import MoviesList from "./components/MoviesList";
import "./App.css";
import MovieForm from "./components/MovieForm";

function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [intervalId, setIntervalId] = useState(null);

  const retryFetch = useCallback(() => {
    const id = setInterval(async () => {
      console.log("Retring in 5 seconds.....");
      setIsLoading(true);
      const response = await fetch("https://swapi.dev/api/films/");
      if (!response.ok) {
        clearInterval(id);        
        retryFetch();
      } else {
        clearInterval(id);
        return response;
      }      
    }, 5000);
    setIntervalId(id);
  }, [setIntervalId]);
  
  const cancelRequestHandler = () => {
    console.log("stop retrying");
    clearInterval(intervalId);
    setIsLoading(false);
    setError(null);
  }

  const fetchMoviesHandler = useCallback(async ()=> {
    setIsLoading(true);
    setError(null);
    try {
      let response = await fetch("https://swapi.dev/api/films/");
      if (!response.ok) {
        response =  retryFetch();
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
  }, [retryFetch]);
  
    
  useEffect(() => {
    fetchMoviesHandler();
  }, [fetchMoviesHandler]);

  return (
    <React.Fragment>
      <section>
        <MovieForm />
      </section>
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
