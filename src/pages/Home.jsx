import { Fancybox, ToolbarColumn } from '@fancyapps/ui';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import birdsImage from '../assets/birds.jpg';
import floraImage from '../assets/flora.jpg';
import insectsImage from '../assets/insects.jpg';
import landscapesImage from '../assets/land-scapes.jpg';
import mammalsImage from '../assets/mammals.jpg';
import reptilesImage from '../assets/reptiles.jpg';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

const gallerySections = [
  {
    title: 'Birds',
    folder: 'birds',
    featuredImage: birdsImage,
    quote:
      '"The bird sings not because it has an answer, but because it has a song" - Maya Angelou',
  },

  {
    title: 'Mammals',
    folder: 'mammals',
    featuredImage: mammalsImage,
    quote:
      '“Art has an ability to connect us beyond the limitations of language” – Rick Rubin',
  },

    {
    title: 'Insects & Spiders',
    folder: 'insects-spiders',
    featuredImage: insectsImage,
    quote:
      '"The world is a stage, and the insects are the actors” – David Attenborough',
  },

    {
    title: 'Reptiles Amphibians',
    folder: 'reptiles-amphibians',
    featuredImage: reptilesImage,
    quote:
      '"The serpent, that crafty, ancient being, knows more than we do" - Carl Jung',
  },

  {
    title: 'Flora',
    folder: 'flora',
    featuredImage: floraImage,
    quote: '"“In every leaf, there\'s a story waiting to be told” Laura Jaworski.',
  },


  {
    title: 'Landscapes',
    folder: 'landscapes',
    featuredImage: landscapesImage,
    quote:
      '"In every walk with nature one receives far more than he seeks" - John Muir',
  },
  // {
  //   title: 'Miscellaneous',
  //   folder: 'miscellaneous',
  //   quote:
  //     '"Photography takes an instant out of time, altering life by holding it still" - Dorothea Lange',
  // },

];

const imageModules = import.meta.glob(
  '../assets/**/*.{jpg,jpeg,png,webp,avif,gif}',
  {
    eager: true,
    query: '?url',
    import: 'default',
  }
);

function getImageTitle(path) {
  return path
    .split('/')
    .pop()
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getImagesByFolder() {
  return Object.entries(imageModules)
    .sort(([firstPath], [secondPath]) => firstPath.localeCompare(secondPath))
    .reduce((groups, [path, src]) => {
      const folder = path.split('/').at(-2);

      if (!groups[folder]) {
        groups[folder] = [];
      }

      groups[folder].push({
        caption: getImageTitle(path),
        src,
        type: 'image',
      });

      return groups;
    }, {});
}

function openGallery(slides, startIndex) {
  Fancybox.show(slides, {
    startIndex,
    theme: 'dark',
    Carousel: {
      infinite: true,
      Toolbar: {
        absolute: true,
        display: {
          [ToolbarColumn.Left]: ['counter'],
          [ToolbarColumn.middle]: [
            'zoomIn',
            'zoomOut',
            'toggle1to1',
            'rotateCCW',
            'rotateCW',
            'flipX',
            'flipY',
          ],
          [ToolbarColumn.right]: ['autoplay', 'fullscreen', 'close'],
        },
      },
    },
  });
}


function Home() {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      AOS.refreshHard();
    }, 150);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <section className="homeWelcome">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12" data-aos="fade-up">
              <h4>Welcome to</h4>
              <h2>Adrian N. A. Elliott Photography</h2>

              <p>
                Adrian N. A. Elliot Photography offers eloquent images that
                captivates the audience. The passionate person behind the entire
                photography venture, started back in his teenage age, with an
                inexpensive mid 60s Zenit SLR to carry forward his passion for
                photography for real life creatures, and different natural
                scenes coverage. Moreover, Eloquent image by Adrian takes the
                entire responsibility of capturing the moments while travelling,
                hiking or birding as Adrian himself is fond of capturing images.
              </p>

              <p>
                Most of the time, I question myself, "Why on earth am I
                struggling up the last stages of this steep mountain encumbered
                by a heavy camera?" with the lens impeding my progress as it
                bashed against the rock face, the resultant photos have always
                seemed to make it worthwhile. Travelling is my passion, and
                Eloquent capture by Adrian is a great testimony of my
                imagination, as I have covered the moments through the lens of
                my camera. I always use the most expensive, and latest equipment
                to capture the beauty of the scenes.
              </p>

              <p>
                Since our inception, eloquent images shot by Adrian are
                high-end, and covered with a motive of giving the viewers a real
                time experience of witnessing the beauty of the place
                themselves. The eloquent portrait by Adrian collection has grown
                massively over the years, and now it has reached a point where
                we've covered topographical wonders, interesting places,
                architectural delights and fascinating flora and fauna captured
                through the lens and captured in Eloquent frames by Adrian.
              </p>

              <p>
                Visit eloquent photographs by Adrian, and explore the perfection
                yourself! Each eloquent image shot by Adrian holds a different
                story to share with you.
              </p>

              <Link to="/about-us">READ MORE</Link>
            </div>
          </div>
        </div>
      </section>

      <HomeGallery />
    </>
  );
}

function HomeGallery() {
  const imagesByFolder = getImagesByFolder();

  return (
    <section className="homeGallery">
      {gallerySections.map((section) => {
        const images = imagesByFolder[section.folder] ?? [];
        const previewImages = images.slice(0, 8);
        const featuredImage = section.featuredImage ?? images[0]?.src;

        return (
          <div className="homeGallery-item" key={section.folder}>
            {featuredImage && (
              <div className="homeGallery-feature">
                <img src={featuredImage} alt={section.title} />
              </div>
            )}

            <div className="container">
              <div className="row">
                <div className="col-12" data-aos="fade-up">
                  <p>{section.quote}</p>
                  <h2>{section.title}</h2>
                </div>
              </div>

              <div className="row g-3">
                {previewImages.map((image, index) => (
                  <div
                    className="col-md-3 col-sm-6"
                    data-aos="fade-up"
                    key={image.src}
                  >
                    <button
                      className="homeGallery-card"
                      type="button"
                      onClick={() => openGallery(images, index)}
                    >
                      <img
                        src={image.src}
                        alt={image.caption}
                        loading="lazy"
                        decoding="async"
                      />
                      <span>
                        <svg aria-hidden="true" viewBox="0 0 24 24">
                          <path d="m20.7 19.3-4.2-4.2a7.8 7.8 0 1 0-1.4 1.4l4.2 4.2 1.4-1.4ZM4.8 10.5a5.7 5.7 0 1 1 11.4 0 5.7 5.7 0 0 1-11.4 0Z" />
                        </svg>
                        {image.caption}
                      </span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="row">
                <div className="col-12" data-aos="fade-up">
                  <Link to={`/gallery/#${section.folder}`}>VIEW ALL</Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}


export default Home;
