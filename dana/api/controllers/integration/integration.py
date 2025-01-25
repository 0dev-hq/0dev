import traceback
import secrets
from flask import Blueprint, request, jsonify, redirect, session
from .factory import OAuthHandlerFactory
import os

integration_bp = Blueprint("integration", __name__)

FRONTEND_URL = os.getenv("FRONTEND_URL")


@integration_bp.route("/oauth/<service>/authorize", methods=["GET"])
def oauth_authorize(service):
    try:
        state = secrets.token_urlsafe(16)
        session["oauth_state"] = state

        redirect_uri = f"{request.host_url}integration/oauth/{service}/callback"
        handler = OAuthHandlerFactory.get_handler(service)
        auth_url = handler.get_authorization_url(state, redirect_uri)

        return jsonify({"auth_url": auth_url}), 200
    except Exception as e:
        print(f"stacktrace: {traceback.format_exc()}")
        return jsonify({"error": f"Failed to initiate OAuth flow: {str(e)}"}), 500


@integration_bp.route("/oauth/<service>/callback", methods=["GET"])
def oauth_callback(service):
    try:
        # state = request.args.get("state")
        # if not state or state != session.get("oauth_state"):
        #     return jsonify({"error": "Invalid or missing state parameter."}), 400

        session.pop("oauth_state", None)
        authorization_code = request.args.get("code")
        print(f"authorization_code: {authorization_code}")
        if not authorization_code:
            return jsonify({"error": "Authorization code not provided."}), 400

        redirect_uri = f"{request.host_url}integration/oauth/{service}/callback"
        handler = OAuthHandlerFactory.get_handler(service)
        token_data = handler.exchange_token(authorization_code, redirect_uri)
        frontend_url = f"{FRONTEND_URL}/up/agent/integration/exchange"
        return redirect(
            f"{frontend_url}?access_token={token_data['access_token']}&refresh_token={token_data.get('refresh_token')}&expires_in={token_data.get('expires_in')}&integration={service}"
        )

    except Exception as e:
        print(f"stacktrace: {traceback.format_exc()}")
        return jsonify({"error": f"Failed to handle callback: {str(e)}"}), 500
