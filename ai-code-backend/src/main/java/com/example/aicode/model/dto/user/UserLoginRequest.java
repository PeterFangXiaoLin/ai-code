package com.example.aicode.model.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.io.Serializable;

@Data
@Schema(description = "用户登录")
public class UserLoginRequest implements Serializable {

    private static final long serialVersionUID = 1770121788191723535L;

    /**
     * 用户账号
     */
    @Schema(description = "用户账号")
    private String userAccount;

    /**
     * 用户密码
     */
    @Schema(description = "用户密码")
    private String userPassword;
}
