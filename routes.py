from flask import Flask, render_template, send_from_directory, jsonify, send_file
import csv
from google.cloud import bigquery
import pandas as pd

app = Flask(__name__)
client = bigquery.Client()

# two decorators, same function
@app.route('/')
@app.route('/index.html')
# gcloud auth application-default login
def index():
    return render_template('index.html')
# @app.route('/index.html')
# def index():
#     return render_template('index.html', the_title='Health in Yorkshire & Humber')

@app.route('/templates/predict.html')
def predict():
    
    # Fetch the patient IDs with Type 2 Diabetes
    query_all = """select person_id 
    from CY_CDM_V1_50k_Random.person
    group by person_id"""

    query_t2d = """
    select person_id 
    from ( select co.condition_concept_id as concept_id , p.person_id, c.concept_name, 
    (EXTRACT(YEAR FROM CURRENT_DATE()) - p.year_of_birth ) as Age, 
    p.race_source_value, p.gender_source_value
    from CY_CDM_V1_50k_Random.condition_occurrence co, CY_CDM_V1_50k_Random.concept c, CY_CDM_V1_50k_Random.person p
    where co.condition_concept_id = c.concept_id and lower(c.concept_name) like '%type 2 diabetes%' and co.person_id = p.person_id
    group by concept_id , p.person_id, c.concept_name, Age, p.race_source_value, p.gender_source_value
    order by p.person_id) sub
    group by person_id;
    """
    query_comorbidities = """
    select concept_name from 
    (SELECT sub.person_id, sub.condition_concept_id, sub.gender_concept_id, sub.Age, sub.race_source_value, sub.gender_source_value, c.concept_name 
    FROM
        (SELECT co.condition_occurrence_id , p.person_id, co.condition_concept_id, co.condition_start_date, co.condition_end_date, 
        p.gender_concept_id,(EXTRACT(YEAR FROM CURRENT_DATE()) - p.year_of_birth ) as Age, p.race_source_value, p.gender_source_value
        FROM ((CY_CDM_V1_50k_Random.condition_occurrence co
            INNER JOIN CY_CDM_V1_50k_Random.person p ON co.person_id = p.person_id) 
            INNER JOIN CY_MYSPACE_SM.t2diabetics d ON co.person_id = d.person_id) 
        GROUP BY co.condition_occurrence_id , p.person_id, co.condition_concept_id, co.condition_start_date, co.condition_end_date, 
        p.gender_concept_id, Age, p.race_source_value, p.gender_source_value
        ORDER BY p.person_id) sub

        LEFT JOIN CY_CDM_V1_50k_Random.concept c ON sub.condition_concept_id = c.concept_id
    GROUP BY sub.person_id, sub.condition_concept_id, sub.gender_concept_id, sub.Age, sub.race_source_value, sub.gender_source_value, c.concept_name
    ORDER BY person_id ) sub
    group by concept_name
    """

    query_all_patients = client.query(query_all)
    query_t2d_patients = client.query(query_t2d)  # Make an API request.
    query_t2d_comorbidities = client.query(query_comorbidities)

    all_patients = []
    t2d_patients = []
    t2d_comorbidities = []
    data = {}
    for row in query_t2d_patients:
        t2d_patients.append(row[0])

    for row in query_all_patients:
        all_patients.append(row[0])
    
    for row in query_t2d_comorbidities:
        t2d_comorbidities.append(row[0])

    pid = []
    target = []
    for i in range(0, len(all_patients)):
        if(all_patients[i] in t2d_patients):
            target.append(1) # 1 for yes
        else:
            target.append(0) # 0 for no
        pid.append(all_patients[i])
    
    for i in t2d_comorbidities:
        data[i] = 0

    data['person_id'] = pid
    data['label'] = target

    # print(data)
    # Make dataframe of the t2d patients 
    df_patients = pd.DataFrame(data)
    df_patients.to_csv('df_patients.csv')
    
    print(df_patients.head())
    print(df_patients.shape)
    return render_template('predict.html')

@app.route('/data/t2dcomorbids_lineage.csv', methods = ['GET','POST'])
def get_csv():
    return 'Hi!'

@app.route('/templates/upset.html')
def upsetTool():
    return render_template('upset.html', the_title='UpSet')

@app.route('/templates/paral.html')
def parallelTool():
    return render_template('paral.html', the_title='Parallel Sets')

@app.route('/templates/paral_concept.html')
def parallelConceptTool():
    return render_template('paral_concept.html', the_title='Parallel Sets')

@app.route('/templates/paral_all.html')
def parallelAllTool():
    return render_template('paral_all.html', the_title='Parallel Sets')

@app.route('/templates/paral_upper.html')
def parallelUpperTool():
    return render_template('paral_upper.html', the_title='Parallel Sets')

@app.route('/templates/rad.html')
def radialTool():
    return render_template('rad.html', the_title='Radial Sets')


@app.route('/templates/test.html')
def dataTest():
    return render_template('test.html', the_title='Parallel Sets')

@app.route('/templates/schemaExp.html')
def dataSchema():
    return render_template('schemaExp.html', the_title='Data Schema')


if __name__ == '__main__':
    app.run(debug=True)
