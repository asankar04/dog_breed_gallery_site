import { useEffect, useState } from 'react';
import DogGallery, { formatBreed } from './DogGallery';
import './App.css';

function App() {
  const [breeds, setBreeds] = useState({});
  const [breed, setBreed] = useState('labrador');
  const [subBreed, setSubBreed] = useState('');
  const [quantity, setQuantity] = useState('12');
  const [loadStatus, setLoadStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const [selection, setSelection] = useState({
    breed: 'labrador',
    subBreed: '',
    quantity: '12',
    revision: 0,
  });

  useEffect(() => {
    const controller = new AbortController();
    setLoadStatus('loading');
    fetch('https://dog.ceo/api/breeds/list/all', { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (
          !response.ok ||
          data.status !== 'success' ||
          !data.message ||
          Array.isArray(data.message) ||
          typeof data.message !== 'object'
        ) {
          throw new Error('Could not load breeds');
        }
        if (!controller.signal.aborted) {
          setBreeds(data.message);
          setLoadStatus('ready');
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadStatus('error');
      });
    return () => controller.abort();
  }, [attempt]);

  const variations = breeds[breed] || [];

  function generateGallery(event) {
    event.preventDefault();
    setSelection((current) => ({
      breed,
      subBreed,
      quantity,
      revision: current.revision + 1,
    }));
  }

  return (
    <div className="app-shell">
      <main className="page-width">
        <section className="intro" aria-labelledby="page-title">
          <h1 id="page-title">
            Find your kind of <span>dog.</span>
          </h1>
          <p className="intro-copy">
            Pick a breed, explore the variations, and meet a gallery full of
            personality.
          </p>
        </section>

        <section className="filter-panel" aria-label="Gallery filters">
          <form className="filter-form" onSubmit={generateGallery}>
            <div className="field">
              <label htmlFor="breed">Breed</label>
              <select
                id="breed"
                value={breed}
                disabled={loadStatus !== 'ready'}
                onChange={(event) => {
                  setBreed(event.target.value);
                  setSubBreed('');
                }}
              >
                {loadStatus !== 'ready' ? (
                  <option value={breed}>
                    {loadStatus === 'loading'
                      ? 'Loading breeds…'
                      : 'Breeds unavailable'}
                  </option>
                ) : (
                  Object.keys(breeds)
                    .sort()
                    .map((name) => (
                      <option key={name} value={name}>
                        {formatBreed(name)}
                      </option>
                    ))
                )}
              </select>
            </div>
            <div className="field">
              <label htmlFor="sub-breed">
                Sub-breed <span>optional</span>
              </label>
              <select
                id="sub-breed"
                value={subBreed}
                disabled={loadStatus !== 'ready' || !variations.length}
                onChange={(event) => setSubBreed(event.target.value)}
              >
                <option value="">
                  {variations.length ? 'All variations' : 'No variations'}
                </option>
                {variations.map((name) => (
                  <option key={name} value={name}>
                    {formatBreed(name)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field quantity-field">
              <label htmlFor="quantity">Photos</label>
              <input
                id="quantity"
                type="number"
                min="1"
                max="50"
                step="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="All"
                aria-describedby="quantity-help"
              />
            </div>
            <button
              className="primary-button"
              type="submit"
              disabled={loadStatus !== 'ready'}
            >
              Show dogs
            </button>
          </form>
          <p className="filter-hint" id="quantity-help">
            Choose 1–50 photos, or leave the count blank to browse the full
            collection.
          </p>
          {loadStatus === 'error' && (
            <p role="alert" className="error-message">
              The breed list couldn't load.{' '}
              <button
                className="text-button"
                onClick={() => setAttempt((value) => value + 1)}
              >
                Try again
              </button>
            </p>
          )}
        </section>

        <DogGallery
          key={selection.revision}
          breed={selection.breed}
          subBreed={selection.subBreed}
          quantity={selection.quantity}
        />
      </main>
      <footer className="page-width site-footer">
        <span>Made by Anit Sankar</span>
        <span>
          Good dogs, courtesy of{' '}
          <a href="https://dog.ceo/dog-api/" target="_blank" rel="noreferrer">
            Dog CEO
          </a>
          .
        </span>
      </footer>
    </div>
  );
}

export default App;
