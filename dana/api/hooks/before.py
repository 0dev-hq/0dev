from flask import request, jsonify, g
import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
import os

SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key")


def authenticate():
    """
    Middleware to validate JWT from the Authorization header.
    Attaches `account_id` to the `g` object for global use.
    """
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Authorization token is missing"}), 401

    try:
        if token.startswith("Bearer "):
            token = token.split(" ")[1]

        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        g.account_id = decoded.get("account")
        g.user_id = decoded.get("user")

    except ExpiredSignatureError:
        print("Token has expired")
        return jsonify({"error": "Token has expired"}), 401
    except InvalidTokenError:
        print("Invalid token")
        return jsonify({"error": "Invalid token"}), 401
