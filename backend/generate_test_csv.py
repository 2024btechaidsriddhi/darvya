import joblib
import pandas as pd
import numpy as np

model = joblib.load('model/mule_detection_model.pkl')
features = list(model.feature_names_in_)

data = []
for i in range(20):
    row = {f: np.random.randn() for f in features}
    row['account_id'] = f'ACC-TEST-{i}'
    row['alert_id'] = f'ALT-TEST-{i}'
    data.append(row)

df = pd.DataFrame(data)
df.to_csv('dummy_test.csv', index=False)
print("CSV created.")
