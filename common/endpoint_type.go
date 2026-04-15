package common

import (
	"strings"

	"github.com/QuantumNous/new-api/constant"
	relayconstant "github.com/QuantumNous/new-api/relay/constant"
)

// GetEndpointTypesByChannelType 获取渠道最优先端点类型（所有的渠道都支持 OpenAI 端点）
func GetEndpointTypesByChannelType(channelType int, modelName string) []constant.EndpointType {
	var endpointTypes []constant.EndpointType
	switch channelType {
	case constant.ChannelTypeJina:
		endpointTypes = []constant.EndpointType{constant.EndpointTypeJinaRerank}
	//case constant.ChannelTypeMidjourney, constant.ChannelTypeMidjourneyPlus:
	//	endpointTypes = []constant.EndpointType{constant.EndpointTypeMidjourney}
	//case constant.ChannelTypeSunoAPI:
	//	endpointTypes = []constant.EndpointType{constant.EndpointTypeSuno}
	//case constant.ChannelTypeKling:
	//	endpointTypes = []constant.EndpointType{constant.EndpointTypeKling}
	//case constant.ChannelTypeJimeng:
	//	endpointTypes = []constant.EndpointType{constant.EndpointTypeJimeng}
	case constant.ChannelTypeAws:
		fallthrough
	case constant.ChannelTypeAnthropic:
		endpointTypes = []constant.EndpointType{constant.EndpointTypeAnthropic, constant.EndpointTypeOpenAI}
	case constant.ChannelTypeVertexAi:
		fallthrough
	case constant.ChannelTypeGemini:
		endpointTypes = []constant.EndpointType{constant.EndpointTypeGemini, constant.EndpointTypeOpenAI}
	case constant.ChannelTypeOpenRouter: // OpenRouter 只支持 OpenAI 端点
		endpointTypes = []constant.EndpointType{constant.EndpointTypeOpenAI}
	case constant.ChannelTypeXai:
		endpointTypes = []constant.EndpointType{constant.EndpointTypeOpenAI, constant.EndpointTypeOpenAIResponse}
	case constant.ChannelTypeSora:
		endpointTypes = []constant.EndpointType{constant.EndpointTypeOpenAIVideo}
	default:
		if IsOpenAIResponseOnlyModel(modelName) {
			endpointTypes = []constant.EndpointType{constant.EndpointTypeOpenAIResponse}
		} else {
			endpointTypes = []constant.EndpointType{constant.EndpointTypeOpenAI}
		}
	}
	if IsImageGenerationModel(modelName) {
		// add to first
		endpointTypes = append([]constant.EndpointType{constant.EndpointTypeImageGeneration}, endpointTypes...)
	}
	return endpointTypes
}

func IsEndpointTypeSupportedByChannel(channelType int, modelName string, endpointType constant.EndpointType) bool {
	if endpointType == "" {
		return true
	}
	for _, supported := range GetEndpointTypesByChannelType(channelType, modelName) {
		if supported == endpointType {
			return true
		}
	}
	return false
}

func GetRequestEndpointType(path string) constant.EndpointType {
	if strings.HasPrefix(path, "/v1/messages") {
		return constant.EndpointTypeAnthropic
	}

	switch relayconstant.Path2RelayMode(path) {
	case relayconstant.RelayModeEmbeddings:
		return constant.EndpointTypeEmbeddings
	case relayconstant.RelayModeImagesGenerations, relayconstant.RelayModeImagesEdits:
		return constant.EndpointTypeImageGeneration
	case relayconstant.RelayModeRerank:
		return constant.EndpointTypeJinaRerank
	case relayconstant.RelayModeResponses:
		return constant.EndpointTypeOpenAIResponse
	case relayconstant.RelayModeResponsesCompact:
		return constant.EndpointTypeOpenAIResponseCompact
	case relayconstant.RelayModeGemini:
		if strings.Contains(path, ":embedContent") || strings.Contains(path, ":batchEmbedContents") {
			return constant.EndpointTypeEmbeddings
		}
		return constant.EndpointTypeGemini
	case relayconstant.RelayModeVideoFetchByID, relayconstant.RelayModeVideoSubmit:
		return constant.EndpointTypeOpenAIVideo
	default:
		return constant.EndpointTypeOpenAI
	}
}
