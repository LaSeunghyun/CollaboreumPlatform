const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Artist = require('../models/Artist');
const Project = require('../models/Project');
const FundingProject = require('../models/FundingProject');
const CommunityPost = require('../models/CommunityPost');
const Event = require('../models/Event');
const Track = require('../models/Track');

// 데이터베이스 연결
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collaboreum');
    console.log('✅ MongoDB 연결 성공');
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error);
    process.exit(1);
  }
};

// 기존 데이터 삭제
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Artist.deleteMany({});
    await Project.deleteMany({});
    await FundingProject.deleteMany({});
    await CommunityPost.deleteMany({});
    await Event.deleteMany({});
    await Track.deleteMany({});
    console.log('🗑️ 기존 데이터 삭제 완료');
  } catch (error) {
    console.error('❌ 데이터 삭제 실패:', error);
  }
};

// 테스트 사용자 생성
const createTestUsers = async () => {
  try {
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = [
      {
        name: '김아티스트',
        username: 'artist1',
        email: 'artist@test.com',
        password: hashedPassword,
        role: 'artist',
        avatar: '/avatars/artist1.jpg',
        bio: '열정적인 음악 아티스트입니다. 다양한 장르의 음악을 만들어내며, 팬들과의 소통을 중요하게 생각합니다.',
        isVerified: true,
        agreeTerms: true,
        agreePrivacy: true,
        agreeMarketing: true
      },
      {
        name: '이아티스트',
        username: 'artist2',
        email: 'artist2@test.com',
        password: hashedPassword,
        role: 'artist',
        avatar: '/avatars/artist2.jpg',
        bio: '미술 작가로서 독창적인 작품을 만들어내는 것을 목표로 합니다.',
        isVerified: true,
        agreeTerms: true,
        agreePrivacy: true,
        agreeMarketing: true
      },
      {
        name: '박팬',
        username: 'fan1',
        email: 'fan@test.com',
        password: hashedPassword,
        role: 'fan',
        avatar: '/avatars/fan1.jpg',
        bio: '다양한 아티스트들의 작품을 즐기고 응원하는 팬입니다.',
        agreeTerms: true,
        agreePrivacy: true,
        agreeMarketing: false
      },
      {
        name: '최팬',
        username: 'fan2',
        email: 'fan2@test.com',
        password: hashedPassword,
        role: 'fan',
        avatar: '/avatars/fan2.jpg',
        bio: '독립 아티스트들을 지원하고 함께 성장하고 싶습니다.',
        agreeTerms: true,
        agreePrivacy: true,
        agreeMarketing: true
      },
      {
        name: '관리자',
        username: 'admin',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin',
        avatar: '/avatars/admin.jpg',
        bio: '플랫폼 관리자입니다.',
        isVerified: true,
        agreeTerms: true,
        agreePrivacy: true,
        agreeMarketing: true
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('👥 테스트 사용자 생성 완료');
    return createdUsers;
  } catch (error) {
    console.error('❌ 사용자 생성 실패:', error);
    throw error;
  }
};

// 테스트 아티스트 프로필 생성
const createTestArtists = async (users) => {
  try {
    const artistUsers = users.filter(user => user.role === 'artist');
    
    const artists = [
      {
        userId: artistUsers[0]._id,
        category: '음악',
        location: '서울',
        rating: 4.5,
        tags: ['인디', '록', '팝'],
        coverImage: '/covers/music-cover1.jpg',
        profileImage: '/profiles/music-profile1.jpg',
        followers: 1250,
        completedProjects: 8,
        activeProjects: 2,
        totalEarned: 2500000,
        genre: ['록', '인디'],
        totalStreams: 50000,
        monthlyListeners: 8000,
        socialLinks: {
          instagram: 'https://instagram.com/artist1',
          youtube: 'https://youtube.com/artist1',
          spotify: 'https://spotify.com/artist1'
        },
        achievements: [
          {
            title: '베스트 신인상',
            description: '2023년 인디 음악상',
            date: new Date('2023-12-01'),
            image: '/achievements/award1.jpg'
          }
        ],
        isVerified: true,
        verificationDate: new Date('2023-06-01'),
        featured: true,
        featuredDate: new Date('2023-11-01')
      },
      {
        userId: artistUsers[1]._id,
        category: '미술',
        location: '부산',
        rating: 4.2,
        tags: ['현대미술', '추상화', '회화'],
        coverImage: '/covers/art-cover1.jpg',
        profileImage: '/profiles/art-profile1.jpg',
        followers: 890,
        completedProjects: 12,
        activeProjects: 1,
        totalEarned: 1800000,
        genre: ['기타'], // 현대미술은 enum에 없으므로 기타로 변경
        totalStreams: 0,
        monthlyListeners: 0,
        socialLinks: {
          instagram: 'https://instagram.com/artist2',
          twitter: 'https://twitter.com/artist2'
        },
        achievements: [
          {
            title: '젊은 작가상',
            description: '2023년 현대미술상',
            date: new Date('2023-09-01'),
            image: '/achievements/award2.jpg'
          }
        ],
        isVerified: true,
        verificationDate: new Date('2023-05-01'),
        featured: false
      }
    ];

    const createdArtists = await Artist.insertMany(artists);
    console.log('🎨 테스트 아티스트 프로필 생성 완료');
    return createdArtists;
  } catch (error) {
    console.error('❌ 아티스트 프로필 생성 실패:', error);
    throw error;
  }
};

// 테스트 프로젝트 생성
const createTestProjects = async (users, artists) => {
  try {
    const projects = [
      {
        title: '첫 번째 앨범 제작',
        description: '인디 록 밴드의 첫 번째 정규 앨범을 제작하는 프로젝트입니다. 다양한 장르의 음악을 담아내며, 독창적인 사운드를 만들어내는 것이 목표입니다.',
        artist: users[0]._id,
        artistName: users[0].name,
        category: '음악',
        status: '진행중',
        progress: 75,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        budget: 5000000,
        spent: 3750000,
        image: '/projects/project1.jpg',
        tasks: [
          {
            id: 1,
            title: '곡 작곡 및 편곡',
            description: '앨범에 수록할 10곡을 작곡하고 편곡합니다.',
            status: '완료',
            progress: 100,
            assignedTo: users[0]._id,
            dueDate: new Date('2024-02-28'),
            completedAt: new Date('2024-02-25')
          },
          {
            id: 2,
            title: '녹음 및 믹싱',
            description: '스튜디오에서 녹음하고 믹싱 작업을 진행합니다.',
            status: '진행중',
            progress: 75,
            assignedTo: users[0]._id,
            dueDate: new Date('2024-04-30')
          },
          {
            id: 3,
            title: '마스터링 및 앨범 아트',
            description: '최종 마스터링과 앨범 아트워크를 완성합니다.',
            status: '대기',
            progress: 0,
            assignedTo: users[0]._id,
            dueDate: new Date('2024-06-15')
          }
        ],
        milestones: [
          {
            id: 1,
            title: '작곡 완료',
            description: '모든 곡의 작곡이 완료됩니다.',
            date: new Date('2024-02-28'),
            status: '완료'
          },
          {
            id: 2,
            title: '녹음 완료',
            description: '모든 곡의 녹음이 완료됩니다.',
            date: new Date('2024-04-30'),
            status: '진행중'
          },
          {
            id: 3,
            title: '앨범 발매',
            description: '최종 앨범이 발매됩니다.',
            date: new Date('2024-06-30'),
            status: '예정'
          }
        ]
      },
      {
        title: '현대미술 전시회',
        description: '추상화와 현대미술 작품들을 전시하는 갤러리 전시회를 기획하고 진행하는 프로젝트입니다.',
        artist: users[1]._id,
        artistName: users[1].name,
        category: '기타',
        status: '계획중',
        progress: 25,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-08-31'),
        budget: 3000000,
        spent: 750000,
        image: '/projects/project2.jpg',
        tasks: [
          {
            id: 1,
            title: '전시 기획 및 기간 설정',
            description: '전시회의 전체적인 기획과 기간을 설정합니다.',
            status: '완료',
            progress: 100,
            assignedTo: users[1]._id,
            dueDate: new Date('2024-02-15'),
            completedAt: new Date('2024-02-10')
          },
          {
            id: 2,
            title: '작품 선별 및 준비',
            description: '전시할 작품들을 선별하고 전시 준비를 합니다.',
            status: '진행중',
            progress: 50,
            assignedTo: users[1]._id,
            dueDate: new Date('2024-04-30')
          },
          {
            id: 3,
            title: '갤러리 계약 및 설치',
            description: '갤러리와 계약하고 작품 설치를 진행합니다.',
            status: '대기',
            progress: 0,
            assignedTo: users[1]._id,
            dueDate: new Date('2024-07-15')
          }
        ],
        milestones: [
          {
            id: 1,
            title: '기획 완료',
            description: '전시회 기획이 완료됩니다.',
            date: new Date('2024-02-15'),
            status: '완료'
          },
          {
            id: 2,
            title: '작품 준비 완료',
            description: '전시할 작품들이 모두 준비됩니다.',
            date: new Date('2024-04-30'),
            status: '진행중'
          },
          {
            id: 3,
            title: '전시회 개막',
            description: '전시회가 개막됩니다.',
            date: new Date('2024-08-01'),
            status: '예정'
          }
        ]
      }
    ];

    const createdProjects = await Project.insertMany(projects);
    console.log('📋 테스트 프로젝트 생성 완료');
    return createdProjects;
  } catch (error) {
    console.error('❌ 프로젝트 생성 실패:', error);
    throw error;
  }
};

// 테스트 펀딩 프로젝트 생성
const createTestFundingProjects = async (users, artists) => {
  try {
    const fundingProjects = [
      {
        title: '인디 록 앨범 제작 펀딩',
        description: '독립적인 사운드와 메시지를 담은 인디 록 앨범을 제작하기 위한 펀딩 프로젝트입니다.',
        artist: users[0]._id,
        artistName: users[0].name,
        category: '음악',
        goalAmount: 10000000,
        currentAmount: 7500000,
        backers: [
          {
            user: users[2]._id,
            amount: 15000,
            pledgedAt: new Date('2024-01-15')
          },
          {
            user: users[3]._id,
            amount: 25000,
            pledgedAt: new Date('2024-01-20')
          }
        ],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        status: '진행중',
        image: '/funding/funding1.jpg',
        executionPlan: {
          stages: [
            {
              name: '작곡 및 편곡',
              description: '앨범 수록곡 작곡 및 편곡',
              budget: 3000000,
              startDate: new Date('2024-01-01'),
              endDate: new Date('2024-02-28'),
              status: '완료',
              progress: 100
            },
            {
              name: '녹음 및 믹싱',
              description: '스튜디오 녹음 및 믹싱',
              budget: 4000000,
              startDate: new Date('2024-03-01'),
              endDate: new Date('2024-04-30'),
              status: '진행중',
              progress: 75
            },
            {
              name: '마스터링 및 제작',
              description: '마스터링 및 앨범 제작',
              budget: 3000000,
              startDate: new Date('2024-05-01'),
              endDate: new Date('2024-06-30'),
              status: '계획',
              progress: 0
            }
          ],
          totalBudget: 10000000
        },
        rewards: [
          {
            title: '디지털 앨범',
            description: '앨범 발매 후 디지털 다운로드',
            amount: 15000,
            claimed: 89
          },
          {
            title: 'CD + 디지털 앨범',
            description: 'CD와 디지털 다운로드',
            amount: 25000,
            claimed: 45
          },
          {
            title: 'LP + 디지털 앨범',
            description: 'LP와 디지털 다운로드',
            amount: 45000,
            claimed: 22
          }
        ]
      },
      {
        title: '현대미술 작품집 출판',
        description: '현대미술 작품들을 담은 고품질 작품집을 출판하는 펀딩 프로젝트입니다.',
        artist: users[1]._id,
        artistName: users[1].name,
        category: '도서',
        goalAmount: 5000000,
        currentAmount: 3200000,
        backers: [
          {
            user: users[2]._id,
            amount: 20000,
            pledgedAt: new Date('2024-02-01')
          },
          {
            user: users[3]._id,
            amount: 35000,
            pledgedAt: new Date('2024-02-05')
          }
        ],
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-04-30'),
        status: '진행중',
        image: '/funding/funding2.jpg',
        executionPlan: {
          stages: [
            {
              name: '작품 선별 및 편집',
              description: '출판할 작품 선별 및 편집',
              budget: 2000000,
              startDate: new Date('2024-02-01'),
              endDate: new Date('2024-03-15'),
              status: '완료',
              progress: 100
            },
            {
              name: '디자인 및 레이아웃',
              description: '책 디자인 및 레이아웃 작업',
              budget: 1500000,
              startDate: new Date('2024-03-16'),
              endDate: new Date('2024-04-15'),
              status: '진행중',
              progress: 60
            },
            {
              name: '인쇄 및 제작',
              description: '실제 인쇄 및 제작',
              budget: 1500000,
              startDate: new Date('2024-04-16'),
              endDate: new Date('2024-05-31'),
              status: '계획',
              progress: 0
            }
          ],
          totalBudget: 5000000
        },
        rewards: [
          {
            title: '디지털 작품집',
            description: 'PDF 형태의 디지털 작품집',
            amount: 20000,
            claimed: 45
          },
          {
            title: '하드커버 작품집',
            description: '고품질 하드커버 작품집',
            amount: 35000,
            claimed: 33
          }
        ]
      }
    ];

    const createdFundingProjects = await FundingProject.insertMany(fundingProjects);
    console.log('💰 테스트 펀딩 프로젝트 생성 완료');
    return createdFundingProjects;
  } catch (error) {
    console.error('❌ 펀딩 프로젝트 생성 실패:', error);
    throw error;
  }
};

// 테스트 커뮤니티 포스트 생성
const createTestCommunityPosts = async (users) => {
  try {
    const posts = [
      {
        title: '인디 음악의 매력에 대해',
        content: '최근에 다양한 인디 음악을 듣고 있는데, 정말 매력적이네요. 특히 독창적인 사운드와 진정성 있는 가사가 인상적입니다. 여러분도 좋아하는 인디 아티스트가 있나요?',
        author: users[2]._id,
        authorName: users[2].name,
        category: '음악',
        tags: ['인디', '음악', '추천'],
        likes: [users[2]._id, users[3]._id],
        dislikes: [],
        views: 156,
        isActive: true
      },
      {
        title: '현대미술 전시회 후기',
        content: '지난 주에 현대미술 전시회를 다녀왔는데, 정말 감동적이었습니다. 추상화의 아름다움을 새롭게 발견할 수 있었어요. 비슷한 전시회를 추천받고 싶습니다.',
        author: users[3]._id,
        authorName: users[3].name,
        category: '미술',
        tags: ['현대미술', '전시회', '후기'],
        likes: [users[2]._id, users[3]._id],
        dislikes: [users[0]._id],
        views: 89,
        isActive: true
      },
      {
        title: '아티스트 지원 방법',
        content: '독립 아티스트들을 지원하고 싶은데, 어떤 방법들이 있을까요? 펀딩 참여, SNS 홍보, 직접 연락 등 다양한 방법이 있다고 들었습니다. 경험이 있으신 분들의 조언을 부탁드려요.',
        author: users[2]._id,
        authorName: users[2].name,
        category: '기타',
        tags: ['아티스트', '지원', '조언'],
        likes: [users[2]._id, users[3]._id, users[0]._id],
        dislikes: [],
        views: 234,
        isActive: true
      }
    ];

    const createdPosts = await CommunityPost.insertMany(posts);
    console.log('💬 테스트 커뮤니티 포스트 생성 완료');
    return createdPosts;
  } catch (error) {
    console.error('❌ 커뮤니티 포스트 생성 실패:', error);
    throw error;
  }
};

// 메인 실행 함수
const seedDatabase = async () => {
  try {
    await connectDB();
    await clearDatabase();
    
    const users = await createTestUsers();
    const artists = await createTestArtists(users);
    const projects = await createTestProjects(users, artists);
    const fundingProjects = await createTestFundingProjects(users, artists);
    const communityPosts = await createTestCommunityPosts(users);
    
    console.log('🎉 모든 테스트 데이터 생성 완료!');
    console.log(`📊 생성된 데이터:`);
    console.log(`   - 사용자: ${users.length}명`);
    console.log(`   - 아티스트: ${artists.length}명`);
    console.log(`   - 프로젝트: ${projects.length}개`);
    console.log(`   - 펀딩 프로젝트: ${fundingProjects.length}개`);
    console.log(`   - 커뮤니티 포스트: ${communityPosts.length}개`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 데이터베이스 시드 실패:', error);
    process.exit(1);
  }
};

// 스크립트 실행
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
