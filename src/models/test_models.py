
import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import the shared Base and all models
from src.models.database import Base
from src.models.identity import EnterpriseProfile
from src.models.finance import BankTransaction, TaxInvoice

class TestModels(unittest.TestCase):

    def setUp(self):
        """Set up a temporary in-memory database for each test."""
        self.engine = create_engine('sqlite:///:memory:')
        Base.metadata.create_all(self.engine) # Create all tables
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

    def tearDown(self):
        """Clean up the database after each test."""
        Base.metadata.drop_all(self.engine)
        self.session.close()

    def test_create_and_link_models(self):
        """Test creating an enterprise and linking finance models to it."""
        # 1. Create an enterprise
        enterprise = EnterpriseProfile(
            name="شرکت یکپارچه آزمون",
            national_id="10300000000",
            economic_code="413000000000"
        )
        self.session.add(enterprise)
        self.session.commit()

        # 2. Create a bank transaction linked to the enterprise
        transaction = BankTransaction(
            enterprise_id=enterprise.id,
            amount=120000000,
            reference_id="TEST-TX-001"
        )
        self.session.add(transaction)

        # 3. Create a tax invoice linked to the enterprise
        invoice = TaxInvoice(
            enterprise_id=enterprise.id,
            amount=120000000,
            tax_id="TEST-INV-001"
        )
        self.session.add(invoice)
        self.session.commit()

        # 4. Verify the data and relationships
        retrieved_enterprise = self.session.query(EnterpriseProfile).filter_by(national_id="10300000000").one()
        self.assertEqual(retrieved_enterprise.name, "شرکت یکپارچه آزمون")

        retrieved_tx = self.session.query(BankTransaction).filter_by(reference_id="TEST-TX-001").one()
        self.assertEqual(retrieved_tx.amount, 120000000)
        self.assertEqual(retrieved_tx.enterprise, retrieved_enterprise)

        retrieved_inv = self.session.query(TaxInvoice).filter_by(tax_id="TEST-INV-001").one()
        self.assertEqual(retrieved_inv.amount, 120000000)
        self.assertEqual(retrieved_inv.enterprise, retrieved_enterprise)

        print("\n--- Integrated Model Test Passed ---")
        print(f"Successfully linked transaction {retrieved_tx.reference_id} to {retrieved_enterprise.name}")
        print(f"Successfully linked invoice {retrieved_inv.tax_id} to {retrieved_enterprise.name}")

if __name__ == '__main__':
    unittest.main()
