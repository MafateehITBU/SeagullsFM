export const PROGRAM_SEGMENTS = {
  moe: {
    match: /moe/i,
    categories: [
      {
        title: 'Trivia & Guessing Games',
        segments: [
          {
            title: 'Spot the Lie',
            description:
              'Moe gives three facts—two are true and one is a lie. Listeners must text in to spot the lie.',
          },
          {
            title: 'The Cast Call',
            description:
              'Moe names three random actors, and listeners must text back the exact movie they all starred in together (e.g., Tom Cruise, Miles Teller, Jennifer Connelly → Top Gun: Maverick).',
          },
          {
            title: 'A-List Alter Ego',
            description:
              'Moe gives the names of three characters played by the same actor. Listeners text in to guess who the actor is.',
          },
          {
            title: 'The Impossible Question',
            description:
              'Moe asks a nearly impossible question to solve and drops clues along the way to help the listeners figure it out.',
          },
          {
            title: 'Reverse Dictionary',
            description:
              'Moe gives the definition or meaning of a word, and the listeners have to guess the correct word.',
          },
          {
            title: 'Reverse Trivia',
            description:
              'Moe gives the answer first (e.g., “I saw them with my own two eyes!”), and listeners text in the funniest or most creative trivia question that fits that answer.',
          },
        ],
      },
      {
        title: 'Music & Audio Challenges',
        segments: [
          {
            title: 'Guess the Movie',
            description:
              'Listeners have to guess the movie based on an audio clip played by Moe.',
          },
          {
            title: 'What Comes Next',
            description:
              'Moe plays a clip of a song and stops it at a certain point. Listeners have to guess the lyrics that come next.',
          },
          {
            title: 'Fast Forward',
            description:
              'Moe plays a clip of a famous song at a fast speed, and listeners have to guess the song.',
          },
          {
            title: 'Name the 3',
            description:
              'Moe plays short snippets of three famous songs, and listeners have to guess the song titles or the artists.',
          },
        ],
      },
      {
        title: 'Humor & Wordplay',
        segments: [
          {
            title: 'Acronym Madness',
            description:
              'Moe gives listeners a real, well-known acronym (like TGIF) and asks them to text in the funniest fake meaning they can think of.',
          },
          {
            title: 'The Bad Advice Bureau',
            description:
              'Moe asks for advice on a fake, funny problem (e.g., “THEY KNOW IT WAS YOU...”). Listeners text in with the absolute worst possible advice.',
          },
        ],
      },
      {
        title: 'Culture & Demographics',
        segments: [
          {
            title: 'Gen Gap',
            description:
              'Gen Z listeners share their slang, and Moe challenges Gen X listeners to call or text in to figure out what it means.',
          },
        ],
      },
    ],
  },
  ninetiesDude: {
    match: /90|dude/i,
    categories: [
      {
        title: 'Show Segments',
        segments: [
          {
            title: 'Today’s Date',
            description:
              'What is special about today’s date, marking things being celebrated around the world.',
          },
          {
            title: 'Traffic Jam Trivia',
            description:
              'Question of the day, where listeners send in their answers.',
          },
          {
            title: 'Top Topic',
            description: 'Hot topic of the day, listeners share their input.',
          },
          {
            title: 'Name that Tune',
            description:
              'Listeners try to guess a song by playing a 20 second part of it.',
          },
          {
            title: 'Trending',
            description: 'Most trending stories on the internet.',
          },
          {
            title: 'Guess the Dude',
            description:
              'Listeners try to guess a person after giving them hints.',
          },
          {
            title: 'What’s in the Box?',
            description:
              'Listeners try to guess what’s in the box after giving them clues about the object.',
          },
          {
            title: 'Mystery Voice',
            description: 'Listeners guess a person by hearing him/her speak.',
          },
          {
            title: 'Back Seat DJ',
            description:
              'A listener is chosen to play 2 songs and sends in a voice note.',
          },
          {
            title: 'Words of Wisdom',
            description: 'Ending the show with a positive story or thought.',
          },
          {
            title: 'Better Call a Lawyer',
            note: 'Weekly',
            description:
              "Our weekly law segment answering everyone's most pressing questions on how to navigate Jordan's many rules and loopholes.",
          },
        ],
      },
    ],
  },
}

export function segmentsForProgram(title) {
  const entry = Object.values(PROGRAM_SEGMENTS).find((item) =>
    item.match.test(title ?? ''),
  )
  return entry?.categories ?? []
}
