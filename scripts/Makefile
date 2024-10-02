# Makefile for deploying landing, UI, and API (API uses Ansible playbook)

AWS_REGION := us-east-1
AWS_PROFILE ?= default

# Bucket names for landing and UI
LANDING_BUCKET := 0dev.io
UI_BUCKET := ui.0dev.io

# Paths and SSH Key for API deployment
PEM_FILE := /Users/mohsen/.ssh/0dev.pem
ANSIBLE_DIR := ./ansible
API_SRC_DIR := $(shell realpath ../back)
API_BUILD_DIR := $(shell realpath ../back)/dist

# Extract Git branch name and commit SHA
GIT_BRANCH := $(shell git rev-parse --abbrev-ref HEAD)
GIT_COMMIT := $(shell git rev-parse --short HEAD)

# API Zip file name with branch and commit information
ZIP_FILE := api-deployment-$(GIT_BRANCH)-$(GIT_COMMIT).zip

.PHONY: deploy-landing deploy-ui deploy-api build-api package-api copy-ui-env build-ui

# Deploy landing page (copies ../landing content to 0dev.io bucket)
deploy-landing:
	@echo "Deploying landing page to $(LANDING_BUCKET)"
	aws s3 sync ../landing s3://$(LANDING_BUCKET) \
		--region $(AWS_REGION) \
		--profile $(AWS_PROFILE) 

# Build UI front-end
build-ui: 
	@echo "Building UI project in ../front"
	cd ../front && npm install && npm run build

# Deploy UI (builds ../front and copies dist content to ui.0dev.io bucket)
deploy-ui: build-ui
	@echo "Deploying UI to $(UI_BUCKET)"
	aws s3 sync ../front/dist s3://$(UI_BUCKET) \
		--region $(AWS_REGION) \
		--profile $(AWS_PROFILE)

# Build the API (npm install and prepare production build)
build-api:
	@echo "Building the API"
	cd $(API_SRC_DIR) && rm -rf dist && npm install && npm run build

# Package the API into a zip file with Git branch and commit SHA, only if it doesn't already exist
package-api: build-api
	echo "Packaging the API with branch: $(GIT_BRANCH), commit: $(GIT_COMMIT)"; \
	rm -f $(API_SRC_DIR)/$(ZIP_FILE); \
	cd $(API_SRC_DIR) && zip -r $(ZIP_FILE) node_modules -x 'dist/*' && cp .env.prod dist/.env && cp package.json dist && cd dist && zip -r ../$(ZIP_FILE) .;

# Deploy API using Ansible (blue/green setup) with branch and commit information
deploy-api: package-api
	@echo "Deploying API using Ansible"
	ansible-playbook $(ANSIBLE_DIR)/playbook-deploy.yml \
		-e "zip_file_path=$(API_SRC_DIR)/$(ZIP_FILE)" \
		-e "git_branch=$(GIT_BRANCH)" \
		-e "git_commit=$(GIT_COMMIT)" \
		-i $(ANSIBLE_DIR)/inventory.ini \
		--private-key=$(PEM_FILE)
