# Private-Blockchain-Implementation

COMPANY: CODTECH IT SOLUTIONS

NAME: PRINCE DEWANGAN

INTERN ID: CT04DZ204

DOMAIN: BLOCK CHAIN TECHNOLOGY

DURATION: 4 WEEKS

MENTOR: NEELA SANTOSH

I've created a comprehensive private blockchain setup with both Hyperledger Fabric and Ethereum networks, complete with a working DApp. Here's what has been delivered:
🏗️ Blockchain Infrastructure
Hyperledger Fabric Private Network

Docker Compose Setup: Multi-container network with 2 orgs, 2 peers, 1 orderer
Certificate Authorities: Automated CA setup for both organizations
Channel Configuration: Pre-configured channel with proper policies
Asset Management Chaincode: Complete JavaScript smart contract for asset registry
Deployment Scripts: Automated network setup and chaincode deployment

Ethereum Private Network

Genesis Block Configuration: Custom private network with pre-funded accounts
Multi-Node Setup: 2 Geth nodes with mining capabilities
Block Explorer: Web interface for network monitoring
Hardhat Integration: Development framework for smart contract deployment

🎨 Sample DApp - Digital Asset Registry
Features

Multi-Network Support: Switch between Fabric and Ethereum networks
Asset Management: Create, view, and manage digital assets on blockchain
Wallet Integration: Connect to blockchain networks
Real-time Dashboard: Live stats and asset monitoring
Responsive Design: Modern React UI with Tailwind CSS

Functionality

Create digital assets (certificates, properties, licenses)
Track ownership and value on blockchain
View transaction history and asset status
Network-specific operations (Fabric chaincode vs Ethereum contracts)

🛠️ Configuration Files Provided
Hyperledger Fabric

docker-compose.yaml - Network container orchestration
configtx.yaml - Channel and organization configuration
crypto-config-*.yaml - Certificate authority setup
chaincode/asset-management/ - Complete Node.js chaincode
scripts/network.sh - Network management automation
scripts/deployCC.sh - Chaincode deployment automation

Ethereum

genesis.json - Custom genesis block configuration
docker-compose.yml - Ethereum node cluster setup
hardhat.config.js - Development framework configuration
setup-network.sh - Network initialization script
