# Use a slim Python image for a smaller footprint
FROM python:3.12-slim

# Set the working directory inside the container
WORKDIR /app

# Copy only requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port FastAPI runs on
EXPOSE 8000

# Start the application using uvicorn
# 0.0.0.0 is mandatory to allow outside connections
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

