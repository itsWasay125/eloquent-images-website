import aboutImage from '../assets/about-us.png';
function AboutUs() {
  return (
    <section className="aboutAdrian">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-sm-6" data-aos="fade-up">
            <h4>ABOUT</h4>
            <h2>Adrian N. A. Elliott Photography</h2>

            <p>
              Adrian N. A. Elliot Photography offers eloquent images that
              captivates the audience. The passionate person behind the entire
              photography venture, started back in his teenage age, with an
              inexpensive mid 60s Zenit SLR to carry forward his passion for
              photography for real life creatures, and different natural scenes
              coverage. Moreover, Eloquent image by Adrian takes the entire
              responsibility of capturing the moments while travelling, hiking
              or birding as Adrian himself is fond of capturing images.
            </p>

            <p>
              Most of the time, I question myself, "Why on earth am I
              struggling up the last stages of this steep mountain encumbered by
              a heavy camera?" with the lens impeding my progress as it bashed
              against the rock face, the resultant photos have always seemed to
              make it worthwhile. Travelling is my passion, and Eloquent capture
              by Adrian is a great testimony of my imagination, as I have
              covered the moments through the lens of my camera. I always use
              the most expensive, and latest equipment to capture the beauty of
              the scenes.
            </p>

            <p>
              Since our inception, eloquent images shot by Adrian are high-end,
              and covered with a motive of giving the viewers a real time
              experience of witnessing the beauty of the place themselves. The
              eloquent portrait by Adrian collection has grown massively over
              the years, and now it has reached a point where we've covered
              topographical wonders, interesting places, architectural delights
              and fascinating flora and fauna captured through the lens and
              captured in Eloquent frames by Adrian.
            </p>

            <p>
              Visit eloquent photographs by Adrian, and explore the perfection
              yourself! Each eloquent image shot by Adrian holds a different
              story to share with you.
            </p>
          </div>

          <div className="col-sm-6" data-aos="fade-up">
            <div className="aboutAdrian-img">
              <img src={aboutImage} alt="Adrian N. A. Elliott Photography" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutUs;
