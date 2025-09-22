import { normalizeArtists, normalizeProjects } from '../normalizers';

describe('home normalizers', () => {
  const baseArtist = {
    id: 'artist-1',
    name: '루나',
    avatar: '/avatars/luna.png',
    category: '일러스트',
    tags: ['디지털', '팬아트'],
    followers: 1234,
  };

  const baseProject = {
    id: 'project-1',
    title: '빛의 서사',
    artist: '루나',
    category: '일러스트',
    thumbnail: '/projects/luna.png',
    currentAmount: 500000,
    targetAmount: 1000000,
    backers: 256,
    daysLeft: 18,
  };

  it('normalizes artist arrays returned directly from the API', () => {
    const artists = normalizeArtists([baseArtist]);

    expect(artists).toHaveLength(1);
    expect(artists[0]).toMatchObject({
      id: 'artist-1',
      name: '루나',
      category: '일러스트',
    });
  });

  it('normalizes artists from a top-level data array', () => {
    const artists = normalizeArtists({ data: [baseArtist] });

    expect(artists).toHaveLength(1);
    expect(artists[0]).toMatchObject({ id: 'artist-1' });
  });

  it('normalizes artists from nested keyed data containers', () => {
    const artists = normalizeArtists({ data: { artists: [baseArtist] } });

    expect(artists).toHaveLength(1);
    expect(artists[0]).toMatchObject({ id: 'artist-1' });
  });

  it('normalizes project arrays returned directly from the API', () => {
    const projects = normalizeProjects([baseProject]);

    expect(projects).toHaveLength(1);
    expect(projects[0]).toMatchObject({
      id: 'project-1',
      title: '빛의 서사',
      artist: '루나',
    });
  });

  it('normalizes projects from a top-level data array', () => {
    const projects = normalizeProjects({ data: [baseProject] });

    expect(projects).toHaveLength(1);
    expect(projects[0]).toMatchObject({ id: 'project-1' });
  });

  it('normalizes projects from nested keyed data containers', () => {
    const projects = normalizeProjects({ data: { projects: [baseProject] } });

    expect(projects).toHaveLength(1);
    expect(projects[0]).toMatchObject({ id: 'project-1' });
  });
});
