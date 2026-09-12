package com.example.aicode.aop;

import com.example.aicode.annotation.AuthCheck;
import com.example.aicode.exception.BusinessException;
import com.example.aicode.exception.ErrorCode;
import com.example.aicode.model.entity.User;
import com.example.aicode.model.enums.UserRoleEnum;
import com.example.aicode.service.UserService;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import static com.example.aicode.constant.UserConstant.ADMIN_ROLE;

/**
 * 权限校验切面
 */
@Aspect
@Component
public class AuthInterceptor {

    @Resource
    private UserService userService;

    @Around("@annotation(authCheck)")
    public Object doInterceptor(ProceedingJoinPoint joinPoint, AuthCheck authCheck) throws Throwable {
        // 获取当前方法需要的权限
        String mustRole = authCheck.mustRole();
        UserRoleEnum mustRoleEnum = UserRoleEnum.getEnumByValue(mustRole);
        // 获取当前登录用户信息
        RequestAttributes requestAttributes = RequestContextHolder.currentRequestAttributes();
        HttpServletRequest request = ((ServletRequestAttributes) requestAttributes).getRequest();
        // 由于获取当前登录信息没登陆会抛异常，所有打算注解就需要登录
        User loginUser = userService.getLoginUser(request);

        // 不需要权限，
        if (mustRoleEnum == null) {
            return joinPoint.proceed();
        }

        // 需要权限，获取当前登录用户所具有的权限
        UserRoleEnum userRoleEnum = UserRoleEnum.getEnumByValue(loginUser.getUserRole());
        // 没权限，拒绝
        if (userRoleEnum == null) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }

        // 需要管理员权限，但是用户不是管理员
        if (ADMIN_ROLE.equals(mustRoleEnum.getValue()) && !UserRoleEnum.ADMIN.equals(userRoleEnum)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }

        // 有权限，放行
        return joinPoint.proceed();
    }
}
