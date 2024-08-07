IMAGE?=jgrerr/copacetic-docker-desktop-extension
TAG?=0.1.0
COPA_VERSION?=latest
CHANGELOG?=default

BUILDER=buildx-multi-arch

INFO_COLOR = \033[0;36m
NO_COLOR   = \033[m

# Check if COPA_VERSION is equal to "latest"
ifeq ($(COPA_VERSION),latest)
    latest_tag := $(shell curl --retry 5 -s "https://api.github.com/repos/project-copacetic/copacetic/releases/latest" | jq -r '.tag_name')
    version := $(subst v,,$(latest_tag))
else
    version := $(COPA_VERSION)
endif

build-extension: prepare-buildx ## Build service image to be deployed as a desktop extension
	docker buildx build --platform linux/amd64,linux/arm64 --tag=$(IMAGE):$(TAG) .

install-extension: build-extension ## Install the extension
	docker extension install $(IMAGE):$(TAG)

update-extension: build-extension ## Update the extension
	docker extension update $(IMAGE):$(TAG)

prepare-buildx: ## Create buildx builder for multi-arch build, if not exists
	docker buildx inspect $(BUILDER) || docker buildx create --name=$(BUILDER) --driver=docker-container --driver-opt=network=host

push-extension: prepare-buildx ## Build & Upload extension image to hub. Do not push if tag already exists: make push-extension tag=0.1
	docker pull $(IMAGE):$(TAG) && echo "Failure: Tag already exists" || docker buildx build --push --builder=$(BUILDER) --platform=linux/amd64,linux/arm64 --build-arg TAG=$(TAG) --build-arg CHANGELOG=$(CHANGELOG) --tag=$(IMAGE):$(TAG) .

build-copa-image: prepare-buildx
	docker buildx build --platform linux/amd64,linux/arm64 --build-arg copa_version=$(version) -t copa-extension container/copa-extension

help: ## Show this help
	@echo Please specify a build target. The choices are:
	@grep -E '^[0-9a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "$(INFO_COLOR)%-30s$(NO_COLOR) %s\n", $$1, $$2}'

.PHONY: help
