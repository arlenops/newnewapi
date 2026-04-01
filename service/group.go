package service

import (
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting"
	"github.com/QuantumNous/new-api/setting/ratio_setting"
)

func GetUserUsableGroups(userGroup string) map[string]string {
	groupsCopy := setting.GetUserUsableGroupsCopy()
	if userGroup != "" {
		specialSettings, b := ratio_setting.GetGroupRatioSetting().GroupSpecialUsableGroup.Get(userGroup)
		if b {
			// 处理特殊可用分组
			for specialGroup, desc := range specialSettings {
				if strings.HasPrefix(specialGroup, "-:") {
					// 移除分组
					groupToRemove := strings.TrimPrefix(specialGroup, "-:")
					delete(groupsCopy, groupToRemove)
				} else if strings.HasPrefix(specialGroup, "+:") {
					// 添加分组
					groupToAdd := strings.TrimPrefix(specialGroup, "+:")
					groupsCopy[groupToAdd] = desc
				} else {
					// 直接添加分组
					groupsCopy[specialGroup] = desc
				}
			}
		}
		// 如果userGroup不在UserUsableGroups中，返回UserUsableGroups + userGroup
		if _, ok := groupsCopy[userGroup]; !ok {
			groupsCopy[userGroup] = "用户分组"
		}
	}
	return groupsCopy
}

func GroupInUserUsableGroups(userGroup, groupName string) bool {
	_, ok := GetUserUsableGroups(userGroup)[groupName]
	return ok
}

func mergeExtraGroups(groups map[string]string, extraGroups []string) map[string]string {
	for _, group := range extraGroups {
		group = strings.TrimSpace(group)
		if group == "" || group == "auto" {
			continue
		}
		if _, ok := groups[group]; ok {
			continue
		}
		groups[group] = setting.GetUsableGroupDescription(group)
	}
	return groups
}

// GetUserEffectiveGroups returns the user's base usable groups plus any
// additional permissions granted by active subscriptions.
func GetUserEffectiveGroups(userId int, userGroup string) map[string]string {
	groups := GetUserUsableGroups(userGroup)
	if userId <= 0 {
		return groups
	}
	extraGroups, err := model.GetActiveSubscriptionPermissionGroups(userId)
	if err != nil {
		common.SysLog("failed to load active subscription permission groups: " + err.Error())
		return groups
	}
	return mergeExtraGroups(groups, extraGroups)
}

func GroupInUserEffectiveGroups(userId int, userGroup, groupName string) bool {
	_, ok := GetUserEffectiveGroups(userId, userGroup)[groupName]
	return ok
}

// GetUserAutoGroup 根据用户分组获取自动分组设置
func GetUserAutoGroup(userGroup string) []string {
	groups := GetUserUsableGroups(userGroup)
	autoGroups := make([]string, 0)
	for _, group := range setting.GetAutoGroups() {
		if _, ok := groups[group]; ok {
			autoGroups = append(autoGroups, group)
		}
	}
	return autoGroups
}

// GetUserEffectiveAutoGroup returns auto routing groups within the user's
// effective permission scope. It preserves the configured auto group order,
// then appends any active subscription permission groups and the base group as
// a final fallback.
func GetUserEffectiveAutoGroup(userId int, userGroup string) []string {
	groups := GetUserEffectiveGroups(userId, userGroup)
	autoGroups := make([]string, 0)
	seen := make(map[string]struct{})
	appendGroup := func(group string) {
		group = strings.TrimSpace(group)
		if group == "" || group == "auto" {
			return
		}
		if _, ok := groups[group]; !ok {
			return
		}
		if _, ok := seen[group]; ok {
			return
		}
		seen[group] = struct{}{}
		autoGroups = append(autoGroups, group)
	}

	for _, group := range setting.GetAutoGroups() {
		appendGroup(group)
	}
	extraGroups, err := model.GetActiveSubscriptionPermissionGroups(userId)
	if err != nil {
		common.SysLog("failed to load active subscription auto groups: " + err.Error())
	} else {
		for _, group := range extraGroups {
			appendGroup(group)
		}
	}
	appendGroup(userGroup)
	return autoGroups
}

// GetUserEffectiveRetryGroups returns the preferred group first, then falls
// back to the user's effective auto-routing groups.
func GetUserEffectiveRetryGroups(userId int, userGroup, preferredGroup string) []string {
	if strings.TrimSpace(preferredGroup) == "" || preferredGroup == "auto" {
		return GetUserEffectiveAutoGroup(userId, userGroup)
	}
	groups := GetUserEffectiveGroups(userId, userGroup)
	retryGroups := make([]string, 0)
	seen := make(map[string]struct{})
	appendGroup := func(group string) {
		group = strings.TrimSpace(group)
		if group == "" || group == "auto" {
			return
		}
		if _, ok := groups[group]; !ok {
			return
		}
		if _, ok := seen[group]; ok {
			return
		}
		seen[group] = struct{}{}
		retryGroups = append(retryGroups, group)
	}
	appendGroup(preferredGroup)
	for _, group := range GetUserEffectiveAutoGroup(userId, userGroup) {
		appendGroup(group)
	}
	return retryGroups
}

// GetUserGroupRatio 获取用户使用某个分组的倍率
// userGroup 用户分组
// group 需要获取倍率的分组
func GetUserGroupRatio(userGroup, group string) float64 {
	ratio, ok := ratio_setting.GetGroupGroupRatio(userGroup, group)
	if ok {
		return ratio
	}
	return ratio_setting.GetGroupRatio(group)
}
