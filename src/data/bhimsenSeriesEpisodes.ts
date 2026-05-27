import { seriesMediaUrl } from '../series/seriesMedia'

export type BhimsenEpisode = {
  id: number
  title: string
  volume: string
  summary: string
  thumbnailFile: string
  /** Empty when runtime is not fixed (e.g. closing piece). */
  duration: string
  featured: boolean
  videoFile: string
}

const rawEpisodes: BhimsenEpisode[] = [
  {
    id: 1,
    title: 'Silence',
    volume: 'Volume 1 - The Rebuke',
    summary:
      'This episode reflects on social silence, migration, and lost national confidence—asking whether a nation can rise while its people remain passive.',
    thumbnailFile: '1.webp',
    duration: '12m 14s',
    featured: false,
    videoFile: 'Compressed Video 1.mp4',
  },
  {
    id: 2,
    title: 'Identity',
    volume: 'Volume 1 - The Rebuke',
    summary:
      'This episode questions dependency, labor, and dignity—challenging whether true strength lies in serving others or building one’s own future.',
    thumbnailFile: '2.webp',
    duration: '10m 43s',
    featured: false,
    videoFile: 'Compressed Video 2.mp4',
  },
  {
    id: 3,
    title: 'Dependency',
    volume: 'Volume 1 - The Rebuke',
    summary:
      'A reflection on remittance, land, and production—asking whether a nation can stand strong if it cannot sustain itself.',
    thumbnailFile: '3.webp',
    duration: '11m 02s',
    featured: false,
    videoFile: 'Compressed Video 3.mp4',
  },
  {
    id: 4,
    title: 'Division',
    volume: 'Volume 1 - The Rebuke',
    summary:
      'This episode reflects on political fragmentation, media influence, and digital noise—questioning whether division is weakening national unity.',
    thumbnailFile: '4.webp',
    duration: '10m 35s',
    featured: false,
    videoFile: 'Compressed Video 4.mp4',
  },
  {
    id: 5,
    title: 'Education Crisis',
    volume: 'Volume 1 - The Rebuke',
    summary:
      'A critique of education without real skill, creativity, or capability in a fast-changing technological world.',
    thumbnailFile: '5.webp',
    duration: '09m 58s',
    featured: false,
    videoFile: 'Compressed Video 5.mp4',
  },
  {
    id: 6,
    title: 'Cultural Disconnection',
    volume: 'Volume 1 - The Rebuke',
    summary:
      'A reflection on imitation, spiritual emptiness, and disconnection from Nepal’s deeper philosophical and cultural roots.',
    thumbnailFile: '6.webp',
    duration: '10m 28s',
    featured: false,
    videoFile: 'Compressed Video 6.mp4',
  },
  {
    id: 7,
    title: 'The Turning Point',
    volume: 'Volume 1 - The Rebuke',
    summary:
      'A shift from blame to responsibility—challenging people to stop complaining and start building.',
    thumbnailFile: '7.webp',
    duration: '11m 10s',
    featured: false,
    videoFile: 'Compressed Video 7.mp4',
  },
  {
    id: 8,
    title: 'Breaking Barriers',
    volume: 'Volume 2 - The Awakening',
    summary:
      'A vision of infrastructure and technology transforming distance into opportunity across Nepal.',
    thumbnailFile: '8.webp',
    duration: '10m 24s',
    featured: false,
    videoFile: 'Compressed Video 8.mp4',
  },
  {
    id: 9,
    title: 'Power of the Himalayas',
    volume: 'Volume 2 - The Awakening',
    summary:
      'A reimagining of the Himalayas as a foundation for digital innovation, intelligence, and global technological advantage.',
    thumbnailFile: '9.webp',
    duration: '10m 51s',
    featured: false,
    videoFile: 'Compressed Video 9.mp4',
  },
  {
    id: 10,
    title: 'Energy Independence',
    volume: 'Volume 2 - The Awakening',
    summary:
      'A vision for turning Nepal’s water resources into energy, sovereignty, and economic strength.',
    thumbnailFile: '10.webp',
    duration: '11m 06s',
    featured: false,
    videoFile: 'Compressed Video 10.mp4',
  },
  {
    id: 11,
    title: 'Digital Sovereignty',
    volume: 'Volume 2 - The Awakening',
    summary:
      'A reflection on data, code, AI, and the new meaning of borders in a digital age.',
    thumbnailFile: '11.webp',
    duration: '10m 47s',
    featured: false,
    videoFile: 'Compressed Video 11.mp4',
  },
  {
    id: 12,
    title: 'Choosing Independence',
    volume: 'Volume 3 - The Rise',
    summary:
      'A challenge to dependency on aid and external support, urging economic self-reliance and dignity.',
    thumbnailFile: '12.webp',
    duration: '09m 55s',
    featured: false,
    videoFile: 'Compressed Video 12.mp4',
  },
  {
    id: 13,
    title: 'Return & Rebuild',
    volume: 'Volume 3 - The Rise',
    summary:
      'A call to students, professionals, and the diaspora to bring their skills, knowledge, and power back into nation-building.',
    thumbnailFile: '13.webp',
    duration: '10m 39s',
    featured: false,
    videoFile: 'Compressed Video 13.mp4',
  },
  {
    id: 14,
    title: 'Integrity & Justice',
    volume: 'Volume 3 - The Rise',
    summary:
      'A reflection on accountability, ethical leadership, justice, and the moral values required for national rise.',
    thumbnailFile: '14.webp',
    duration: '10m 12s',
    featured: false,
    videoFile: 'Compressed Video 14.mp4',
  },
  {
    id: 15,
    title: 'A Nation Rises',
    volume: 'Volume 3 - The Rise',
    summary:
      'The final unifying episode—calling for collective identity, shared responsibility, and a new national future.',
    thumbnailFile: '15.webp',
    duration: '11m 22s',
    featured: false,
    videoFile: 'Compressed Video 15.mp4',
  },
  {
    id: 16,
    title: 'Closing Chapter',
    volume: 'Series Finale',
    summary:
      'A short closing piece — a distilled emotional and symbolic end to the series arc.',
    thumbnailFile: '16.webp',
    duration: '',
    featured: false,
    videoFile: 'Final Video - Anthem.mp4',
  },
]

export type BhimsenEpisodeResolved = BhimsenEpisode & {
  thumbnailUrl: string
  videoUrl: string
}

export const bhimsenEpisodes: BhimsenEpisodeResolved[] = rawEpisodes.map((e) => ({
  ...e,
  thumbnailUrl: seriesMediaUrl(e.thumbnailFile),
  videoUrl: seriesMediaUrl(e.videoFile),
}))

export const rowConfig: {
  name: string
  filter: (ep: BhimsenEpisodeResolved) => boolean
}[] = [
  { name: 'Volume 1 - The Rebuke', filter: (ep) => ep.volume === 'Volume 1 - The Rebuke' },
  { name: 'Volume 2 - The Awakening', filter: (ep) => ep.volume === 'Volume 2 - The Awakening' },
  { name: 'Volume 3 - The Rise', filter: (ep) => ep.volume === 'Volume 3 - The Rise' },
  { name: 'Series Finale', filter: (ep) => ep.volume === 'Series Finale' },
]
