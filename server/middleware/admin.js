const adminMiddleware = (req, res, next) => {
  try {
    // Check if user exists and has admin role
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    // 관리자 권한 확인
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required',
        requiredRole: 'admin',
        userRole: req.user.role
      });
    }

    // 관리자 활동 로깅
    console.log(`Admin access: ${req.user.email} (${req.user.role}) - ${req.method} ${req.path}`);
    
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

// 특정 관리자 권한 확인 미들웨어
const requireAdminPermission = (permission) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'Authentication required' 
        });
      }

      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false,
          message: 'Admin access required' 
        });
      }

      // 관리자 권한 세분화 (향후 확장 가능)
      const adminPermissions = {
        'user_management': ['view_users', 'edit_users', 'delete_users'],
        'content_management': ['view_content', 'edit_content', 'delete_content'],
        'system_management': ['view_logs', 'manage_settings', 'backup_data']
      };

      // 현재는 모든 관리자가 모든 권한을 가짐
      // 향후 세분화된 권한 시스템 구현 시 사용
      console.log(`Admin permission check: ${req.user.email} - ${permission}`);
      
      next();
    } catch (error) {
      console.error('Admin permission middleware error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error' 
      });
    }
  };
};

module.exports = { adminMiddleware, requireAdminPermission };
