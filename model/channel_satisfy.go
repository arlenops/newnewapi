package model

import (
	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/setting/ratio_setting"
)

func IsChannelEnabledForGroupModel(group string, modelName string, endpointType constant.EndpointType, channelID int) bool {
	if group == "" || modelName == "" || channelID <= 0 {
		return false
	}
	if !common.MemoryCacheEnabled {
		return isChannelEnabledForGroupModelDB(group, modelName, endpointType, channelID)
	}

	channelSyncLock.RLock()
	defer channelSyncLock.RUnlock()

	if group2endpoint2model2channels == nil {
		return false
	}

	if isChannelIDInList(getChannelsByEndpointModelLocked(group, modelName, endpointType), channelID) {
		return true
	}
	return false
}

func IsChannelEnabledForAnyGroupModel(groups []string, modelName string, endpointType constant.EndpointType, channelID int) bool {
	if len(groups) == 0 {
		return false
	}
	for _, g := range groups {
		if IsChannelEnabledForGroupModel(g, modelName, endpointType, channelID) {
			return true
		}
	}
	return false
}

func isChannelEnabledForGroupModelDB(group string, modelName string, endpointType constant.EndpointType, channelID int) bool {
	modelNames := []string{modelName}
	normalized := ratio_setting.FormatMatchingModelName(modelName)
	if normalized != "" && normalized != modelName {
		modelNames = append(modelNames, normalized)
	}

	var channel Channel
	if err := DB.Select("id", "type").First(&channel, "id = ?", channelID).Error; err != nil {
		return false
	}

	var abilities []Ability
	err := DB.Model(&Ability{}).
		Where(commonGroupCol+" = ? and model IN ? and channel_id = ? and enabled = ?", group, modelNames, channelID, true).
		Find(&abilities).Error
	if err != nil {
		return false
	}
	for _, ability := range abilities {
		if common.IsEndpointTypeSupportedByChannel(channel.Type, ability.Model, endpointType) {
			return true
		}
	}
	return false
}

func isChannelIDInList(list []int, channelID int) bool {
	for _, id := range list {
		if id == channelID {
			return true
		}
	}
	return false
}
