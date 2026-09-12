package com.example.aicode.model.dto.user;

import com.example.aicode.common.PageRequest;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

/**
 * 管理员分页查询用户请求
 */
@EqualsAndHashCode(callSuper = true)
@Data
@Schema(description = "分页查询请求")
public class UserQueryRequest extends PageRequest implements Serializable {

    /**
     * id
     */
    @Schema(description = "id")
    private Long id;

    /**
     * 用户昵称
     */
    @Schema(description = "用户昵称")
    private String userName;

    /**
     * 账号
     */
    @Schema(description = "账号")
    private String userAccount;

    /**
     * 简介
     */
    @Schema(description = "简介")
    private String userProfile;

    /**
     * 用户角色：user/admin/ban
     */
    @Schema(description = "用户角色")
    private String userRole;

    private static final long serialVersionUID = 1L;
}
