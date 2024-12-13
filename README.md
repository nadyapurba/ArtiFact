# ArtiFact Backend and Machine Learning Model

## AI Image Prediction using Convolutional Neural Network (CNN)
## Description
We are using <b>backpropagation</b> algorithm to train the CNN model.
- Data is sourced from the "real-ai-art" dataset, balanced by reducing AI-generated data, and processed using ImageDataGenerator.
- We use Convolutional Neural Network (CNN) to predict images.
- The model is trained on the preprocessed dataset for 15 epochs with early stopping enabled.
- Evaluation is performed using a confusion matrix and a classification report.
- The model is converted to TFLite format for lightweight inference.
