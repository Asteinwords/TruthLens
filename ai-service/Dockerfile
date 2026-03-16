# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Install system dependencies (needed for OpenCV and MediaPipe)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy your folder into the container
COPY . /app

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Hugging Face usually uses port 7860 by default
ENV PORT=7860
EXPOSE 7860

# Start the service
CMD ["python", "main.py"]
