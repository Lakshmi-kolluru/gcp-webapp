#!groovy

node {

 stage ('Build Docker Container')
 try {
 openshiftBuild(buildConfig: 'vesta-betaui' , waitTime: "3600000", showBuildLogs: "true", verbose: "true")
 } catch(err) {
      error "Program failed, please read logs..."
 }
 
 stage ('Deploy on Dev')
 try {
 openshiftDeploy depCfg: 'vesta-betaui'
// openshiftScale(deploymentConfig: 'vesta-ui',replicaCount: '1')
 } catch(err) {
       error "Program failed, please read logs..."
 }
 

 stage ('Verify Deployment')
 try {
 openshiftVerifyDeployment depCfg: 'vesta-betaui', replicaCount: '1', verbose: 'false', verifyReplicaCount: 'true', waitTime: '', waitUnit: 'sec'

 } catch(err) {
       error "Program failed, please read logs..."
 } 
    
}
