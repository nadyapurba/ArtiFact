# ArtiFact Backend and Machine Learning Model

## AI Image Prediction using Convolutional Neural Network (CNN)
### Description
We are using <b>backpropagation</b> algorithm to train the CNN model.
- Data is sourced from the "real-ai-art" dataset, balanced by reducing AI-generated data, and processed using ImageDataGenerator.
- We use Convolutional Neural Network (CNN) to predict images.
- The model is trained on the preprocessed dataset for 15 epochs with early stopping enabled.
- Evaluation is performed using a confusion matrix and a classification report.
- The model is converted to TFLite format for lightweight inference.

### Dataset
Using "real-ai-art" <b>AI-ArtBench</b> by Ravidu Silva
https://www.kaggle.com/datasets/ravidussilva/real-ai-art

AI-ArtBench is a dataset that contains 180,000+ art images. 60,000 of them are human-drawn art that was directly taken from ArtBench-10 dataset and the rest is generated equally using Latent Diffusion and Standard Diffusion models. The human-drawn art is in 256x256 resolution and images generated using Latent Diffusion and Standard Diffusion has 256x256 and 768x768 resolutions respectively.

### Libraries
- <img src="https://img.shields.io/badge/Python-3.6+-blue.svg" alt="Python version">
- <img src="https://img.shields.io/badge/Library-TensorFlow-blue.svg" alt="TensorFlow">
- <img src="https://img.shields.io/badge/Library-Keras-blue.svg" alt="Keras">
- <img src="https://img.shields.io/badge/Library-NumPy-blue.svg" alt="NumPy">
- <img src="https://img.shields.io/badge/Library-Matplotlib-blue.svg" alt="Matplotlib">
- <img src="https://img.shields.io/badge/Library-scikit--learn-blue.svg" alt="scikit-learn">
- <img src="https://img.shields.io/badge/Library-Seaborn-blue.svg" alt="Seaborn">
- <img src="https://img.shields.io/badge/Library-Pandas-blue.svg" alt="Pandas">
- <img src="https://img.shields.io/badge/Library-Pillow-blue.svg" alt="Pillow">
- <img src="https://img.shields.io/badge/Library-OpenCV-orange.svg" alt="OpenCV">
- <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab">

## Deployment
