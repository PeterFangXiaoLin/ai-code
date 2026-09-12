package com.example.aicode.model.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.io.Serializable;

/**
 * 用户注册
 */
@Data
@Schema(description = "用户注册")
public class UserRegisterRequest implements Serializable {

    private static final long serialVersionUID = 6588127235469383129L;

    /**
     * 账号
     */
    @Schema(description = "账号")
    private String userAccount;

    /**
     * 密码
     */
    @Schema(description = "密码")
    private String userPassword;

    /**
     * 确认密码
     */
    @Schema(description = "确认密码")
    private String checkPassword;
}
