const mongoose = require('mongoose');
const Project = require('../models/Project');
const { FundingProjectStatus } = require('../constants/enums');

/**
 * 프로젝트 상태를 자동으로 업데이트하는 스크립트
 * 시작일과 종료일을 기준으로 프로젝트 상태를 계산하고 업데이트합니다.
 */

const calculateProjectStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  // 시작일 전이면 대기 상태
  if (now < start) {
    return FundingProjectStatus.DRAFT;
  }

  // 종료일 이후면 종료 상태
  if (now > end) {
    return FundingProjectStatus.CLOSED;
  }

  // 시작일부터 종료일까지는 진행 중
  return FundingProjectStatus.COLLECTING;
};

const updateProjectStatuses = async () => {
  try {
    console.log('프로젝트 상태 업데이트 시작...');

    // 모든 프로젝트 조회
    const projects = await Project.find({
      startDate: { $exists: true },
      endDate: { $exists: true },
    });

    let updatedCount = 0;

    for (const project of projects) {
      const calculatedStatus = calculateProjectStatus(
        project.startDate,
        project.endDate,
      );

      // 상태가 변경된 경우에만 업데이트
      if (project.status !== calculatedStatus) {
        await Project.findByIdAndUpdate(project._id, {
          status: calculatedStatus,
          updatedAt: new Date(),
        });

        updatedCount++;
        console.log(
          `프로젝트 ${project.title} 상태 업데이트: ${project.status} -> ${calculatedStatus}`,
        );
      }
    }

    console.log(
      `프로젝트 상태 업데이트 완료. ${updatedCount}개 프로젝트 업데이트됨.`,
    );
  } catch (error) {
    console.error('프로젝트 상태 업데이트 중 오류 발생:', error);
  }
};

// 스크립트가 직접 실행된 경우
if (require.main === module) {
  // 데이터베이스 연결
  mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/collaboreum',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  );

  mongoose.connection.on('connected', async () => {
    console.log('데이터베이스에 연결되었습니다.');
    await updateProjectStatuses();
    process.exit(0);
  });

  mongoose.connection.on('error', error => {
    console.error('데이터베이스 연결 오류:', error);
    process.exit(1);
  });
}

module.exports = { updateProjectStatuses, calculateProjectStatus };
