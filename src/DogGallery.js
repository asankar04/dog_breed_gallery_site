import { useEffect, useState } from 'react';

export function formatBreed(name) {
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

/** @typedef {{ image: string, label: string, index: number }} DogCardProps */
/** @param {DogCardProps} props */
function DogCard({ image, label, index }) {
  const [failed, setFailed] = useState(false);
  return (
    <article className="dog-card">
      <a
        className="dog-photo"
        href={image}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${label} photo ${index + 1}`}
      >
        {failed ? (
          <span className="image-fallback">This photo couldn't load</span>
        ) : (
          <img
            src={image}
            alt={`A ${label.toLowerCase()}`}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
        )}
      </a>
    </article>
  );
}

/** @typedef {{ breed: string, subBreed: string, quantity: string }} DogGalleryProps */
/** @param {DogGalleryProps} props */
function DogGallery({ breed, subBreed, quantity }) {
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('loading');
  const [visibleCount, setVisibleCount] = useState(24);
  const [attempt, setAttempt] = useState(0);
  const label = formatBreed([subBreed, breed].filter(Boolean).join(' '));

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    setImages([]);
    setVisibleCount(24);
    const path = [breed, subBreed]
      .filter(Boolean)
      .map(encodeURIComponent)
      .join('/');
    const endpoint = `https://dog.ceo/api/breed/${path}/images${quantity ? `/random/${quantity}` : ''}`;
    fetch(endpoint, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (
          !response.ok ||
          data.status !== 'success' ||
          !Array.isArray(data.message)
        )
          throw new Error('Could not load photos');
        if (!controller.signal.aborted) {
          setImages([...new Set(data.message)]);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus('error');
      });
    return () => controller.abort();
  }, [breed, subBreed, quantity, attempt]);

  return (
    <section
      className="gallery-section"
      aria-labelledby="gallery-title"
      aria-busy={status === 'loading'}
    >
      <div className="gallery-heading">
        <div>
          <h2 id="gallery-title">{label}</h2>
        </div>
        <p className="gallery-count" role="status">
          {status === 'loading'
            ? 'Finding your dogs…'
            : status === 'error'
              ? 'Photos unavailable'
              : `${images.length} ${images.length === 1 ? 'photo' : 'photos'} to brighten your day`}
        </p>
      </div>
      {status === 'loading' && (
        <div className="gallery-grid" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="card-placeholder" />
          ))}
        </div>
      )}
      {status === 'error' && (
        <div className="gallery-message" role="alert">
          <h3>A small fetching problem.</h3>
          <p>We couldn't reach the photo collection. Give it another try.</p>
          <button
            className="primary-button"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Try again
          </button>
        </div>
      )}
      {status === 'ready' && images.length === 0 && (
        <div className="gallery-message">
          <h3>No dogs in this collection yet.</h3>
          <p>Try another breed or variation.</p>
        </div>
      )}
      {status === 'ready' && (
        <div className="gallery-grid">
          {images.slice(0, visibleCount).map((image, index) => (
            <DogCard key={image} image={image} label={label} index={index} />
          ))}
        </div>
      )}
      {status === 'ready' && visibleCount < images.length && (
        <div className="load-more">
          <button
            className="secondary-button"
            onClick={() => setVisibleCount((count) => count + 24)}
          >
            Show more dogs
          </button>
          <p>
            Showing {Math.min(visibleCount, images.length)} of {images.length}{' '}
            photos
          </p>
        </div>
      )}
    </section>
  );
}

export default DogGallery;
