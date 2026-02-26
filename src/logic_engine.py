
import json
from thefuzz import fuzz
import datetime
from dateutil.relativedelta import relativedelta
from dateutil.rrule import rrule, MONTHLY, FR

class LogicEngine:
    def __init__(self, taxonomy_path='c:\\Users\\Administrator\\Documents\\dastyar-360\\src\\content_taxonomy.json'):
        """Initializes the Logic Engine by loading the content taxonomy."""
        self.taxonomy = self._load_taxonomy(taxonomy_path)
        if not self.taxonomy:
            raise ValueError("Failed to load or parse the content taxonomy.")
        
        self.alert_structure = self.taxonomy.get('alert_message_structure', {})
        self.gantt_tasks = self.taxonomy.get('gantt_chart_tasks', [])

    def _load_taxonomy(self, path):
        """Loads the JSON taxonomy file from the given path."""
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Error: Taxonomy file not found at {path}")
            return None
        except json.JSONDecodeError:
            print(f"Error: Could not decode JSON from {path}")
            return None

    def generate_health_checklist_alert(self, company_profile):
        """
        Analyzes a company profile against the 'scale_logic' rules.
        Example Rule: A 'Large' company must have 'حسابرسی رسمی' mentioned in its compliance documents.
        """
        company_scale_name = company_profile.get('scale_name')
        if not company_scale_name:
            return None

        # Find the rule for the specific scale from the list of rules
        scale_rule = next((rule for rule in self.taxonomy.get('scale_logic', []) if rule.get('name') == company_scale_name), None)

        if not scale_rule:
            return None # No rule found for this scale name

        # --- Example Logic for 'Large' scale ---
        if company_scale_name == 'Large':
            required_compliance = "حسابرسی رسمی"
            company_docs = company_profile.get('compliance_docs', [])

            # Check if the required compliance is mentioned in any of the docs
            has_compliance = any(required_compliance in doc for doc in company_docs)

            if not has_compliance:
                alert = self.alert_structure.copy()
                alert['alert_id'] = "CHK-002"
                alert['type'] = "Regulatory Compliance"
                alert['priority'] = "High"
                alert['title'] = f"الزامات مقیاس {company_scale_name} رعایت نشده است"
                alert['summary'] = f"برای کسب‌وکارهای در مقیاس {company_scale_name}، داشتن گواهی '{required_compliance}' الزامی است. این مورد در اسناد شما یافت نشد."
                alert['call_to_action'] = "لطفاً نسبت به بارگذاری گواهی حسابرسی رسمی اقدام نمایید."
                alert['source'] = "Dastyar 360 Logic Engine"
                return alert
        
        return None # Company is compliant or no specific rule applied

    def reconcile_transactions(self, bank_transactions: list, tax_invoices: list, tolerance_percentage=5):
        """
        Compares the total sum of deposits against the total sum of issued tax invoices.
        Generates a single alert if the total deposits significantly exceed total invoices.
        
        :param bank_transactions: List of BankTransaction SQLAlchemy objects.
        :param tax_invoices: List of TaxInvoice SQLAlchemy objects.
        :param tolerance_percentage: The allowed percentage difference before triggering an alert.
        """
        alerts = []
        
        # Calculate total deposits (where is_debit is False)
        total_deposits = sum(tx.amount for tx in bank_transactions if not tx.is_debit)
        
        # Calculate total from all tax invoices
        total_invoiced = sum(inv.total_amount for inv in tax_invoices)
        
        # Check if deposits exceed invoices beyond the tolerance threshold
        if total_deposits > total_invoiced * (1 + tolerance_percentage / 100):
            unaccounted_amount = total_deposits - total_invoiced
            
            alert = self.alert_structure.copy()
            alert['alert_id'] = "FIN-002" # Financial Alert 002 - Mismatch Summary
            alert['type'] = "Financial"
            alert['priority'] = "High"
            alert['title'] = "مغایرت بین مجموع واریزی‌ها و فاکتورهای صادره"
            alert['summary'] = (
                f"مجموع واریزی‌های بانکی شما ({total_deposits:,.0f} ریال) به طور قابل توجهی "
                f"بیشتر از مجموع فاکتورهای صادر شده شما ({total_invoiced:,.0f} ریال) است. "
                f"این مغایرت به میزان {unaccounted_amount:,.0f} ریال می‌تواند نشان‌دهنده درآمد ثبت نشده باشد."
            )
            alert['call_to_action'] = "تراکنش‌های بانکی و فاکتورهای خود را بررسی کرده و در صورت نیاز فاکتورهای جدید صادر کنید."
            alert['source'] = "Dastyar 360 Reconciliation Engine"
            
            # Add more details for context
            alert['details'] = {
                "total_deposits_rial": total_deposits,
                "total_invoiced_rial": total_invoiced,
                "unaccounted_amount_rial": unaccounted_amount,
                "tolerance_percentage": tolerance_percentage
            }
            
            alerts.append(alert)
            
        return alerts

    def generate_legal_gantt_chart(self, enterprise_profile: dict):
        """
        Generates a list of applicable legal tasks for an enterprise based on its profile.
        """
        tasks = []
        today = datetime.date.today()
        enterprise_scale = enterprise_profile.get('scale_name')
        # enterprise_industry = enterprise_profile.get('industry') # Assuming industry is part of the profile

        gantt_rules = self.gantt_tasks

        for rule in gantt_rules:
            # Check if the rule applies to the enterprise's scale
            if enterprise_scale not in rule['applies_to_scale']:
                continue

            # --- Deadline Calculation Logic ---
            due_date = None
            if rule['deadline_rule'] == 'end_of_month':
                # Last day of the current month
                due_date = today + relativedelta(day=31)
            elif rule['deadline_rule'] == '15_days_after_season_end':
                # Find the end of the current quarter/season
                current_quarter = (today.month - 1) // 3 + 1
                season_end_month = current_quarter * 3
                season_end_day = 31 if season_end_month in [1, 3, 5, 7, 8, 10, 12] else 30
                season_end_date = datetime.date(today.year, season_end_month, 1) + relativedelta(day=season_end_day)
                due_date = season_end_date + relativedelta(days=15)
            elif rule['deadline_rule'] == '45_days_after_season_end':
                current_quarter = (today.month - 1) // 3 + 1
                season_end_month = current_quarter * 3
                season_end_day = 31 if season_end_month in [1, 3, 5, 7, 8, 10, 12] else 30
                season_end_date = datetime.date(today.year, season_end_month, 1) + relativedelta(day=season_end_day)
                due_date = season_end_date + relativedelta(days=45)

            if due_date:
                task = {
                    "task_id": rule['task_id'],
                    "title": rule['title'],
                    "responsible_body": rule['responsible_body'],
                    "due_date": due_date.isoformat(),
                    "status": "Pending" # Default status
                }
                tasks.append(task)

        return tasks

    def check_brand_similarity(self, client_brand_name: str, new_trademarks: list, similarity_threshold=80):
        """
        Compares a client's brand name against a list of newly registered trademarks using thefuzz.
        Generates an alert if a similar name is found.
        """
        alerts = []

        for trademark in new_trademarks:
            trademark_name = trademark.get('name', '')

            # Calculate similarity using token_set_ratio for robust matching
            similarity = fuzz.token_set_ratio(client_brand_name, trademark_name)

            if similarity >= similarity_threshold:
                alert = self.alert_structure.copy()
                alert['alert_id'] = "WTC-001"  # Watchdog Trademark 001
                alert['crisis_level'] = "critical"
                alert['legal_reference'] = "قانون ثبت اختراعات، طرح‌های صنعتی و علائم تجاری"
                alert['financial_impact_usd'] = 50000 # Example potential cost of legal action
                alert['call_to_action_button'] = {
                    "text": "بررسی و اقدام حقوقی",
                    "type": "external_link",
                    "target": trademark.get('source_url', '#')
                }
                alert['title'] = "هشدار شباهت نام تجاری"
                alert['summary'] = f"یک علامت تجاری جدید با نام «{trademark.get('name')}» توسط «{trademark.get('owner_name')}» ثبت شده است که شباهت بالایی ({similarity}%) با نام شرکت شما «{client_brand_name}» دارد."
                alert['source'] = "Dastyar 360 Brand Watchdog"
                alerts.append(alert)
        
        return alerts


if __name__ == '__main__':
    print("--- Initializing Dastyar 360 Logic Engine ---")
    try:
        engine = LogicEngine()
        print("Engine initialized successfully.")

        # --- Test Case 1: A 'Large' company missing the required compliance doc ---
        print("\n--- Running Test Case 1: Non-compliant Large Company ---")
        large_company_profile = {
            "name": "شرکت بزرگ نمونه",
            "scale_name": "Large",
            "activity": "تولید مواد غذایی",
            "compliance_docs": [
                "گواهی استاندارد محصول",
                "پروانه بهره برداری"
            ]
        }
        alert1 = engine.generate_health_checklist_alert(large_company_profile)
        if alert1:
            print("Generated Alert:")
            for key, value in alert1.items():
                print(f"  {key}: {value}")
        else:
            print("No financial alerts generated.")

        # --- Test Case 5: Brand Watchdog ---
        print("\n--- Running Test Case 5: Brand Watchdog ---")
        my_brand = "کالای اصلی"
        scraped_trademarks = [
            {'name': 'کالای تقلبی', 'owner_name': 'شرکت متقلب', 'source_url': 'http://example.com/1'}, # Dissimilar
            {'name': 'کالای اصلی من', 'owner_name': 'شرکت رقیب', 'source_url': 'http://example.com/2'}, # Similar
            {'name': 'محصول بی ربط', 'owner_name': 'شرکت ثالث', 'source_url': 'http://example.com/3'}, # Dissimilar
        ]

        brand_alerts = engine.check_brand_similarity(my_brand, scraped_trademarks)

        if brand_alerts:
            print(f"Generated {len(brand_alerts)} brand alert(s):")
            for alert in brand_alerts:
                print("  --- Alert Details ---")
                for key, value in alert.items():
                    if isinstance(value, dict):
                        print(f"    {key}:")
                        for sub_key, sub_value in value.items():
                            print(f"      {sub_key}: {sub_value}")
                    else:
                        print(f"    {key}: {value}")
        else:
            print("No brand alerts generated.")

        # --- Test Case 6: Gantt Chart Generation ---
        print("\n--- Running Test Case 6: Gantt Chart Generation ---")
        large_enterprise_profile = {'scale_name': 'Large'}
        gantt_tasks = engine.generate_legal_gantt_chart(large_enterprise_profile)

        if gantt_tasks:
            print(f"Generated {len(gantt_tasks)} legal tasks for a 'Large' enterprise:")
            for task in gantt_tasks:
                print(f"  - {task['title']} (Due: {task['due_date']}) - Responsible: {task['responsible_body']}")
        else:
            print("No legal tasks generated for the gantt chart.")

        # --- Test Case 2: A 'Large' company that IS compliant ---
        print("\n--- Running Test Case 2: Compliant Large Company ---")
        compliant_large_company = {
            "name": "شرکت بزرگ منطبق",
            "scale_name": "Large",
            "compliance_docs": [
                "گزارش حسابرسی رسمی سال مالی 1400"
            ]
        }
        alert2 = engine.generate_health_checklist_alert(compliant_large_company)
        if alert2:
            print("Generated Alert:", alert2)
        else:
            print("No alert generated.")

        # --- Test Case 3: A 'Medium' company (no specific rule for it in this function) ---
        print("\n--- Running Test Case 3: Medium Company ---")
        medium_company_profile = {
            "name": "کسب‌وکار متوسط نمونه",
            "scale_name": "Medium",
            "compliance_docs": []
        }
        alert3 = engine.generate_health_checklist_alert(medium_company_profile)
        if alert3:
            print("Generated Alert:", alert3)
        else:
            print("No alert generated.")

        # --- Test Case 4: Reconcile financial transactions ---
        print("\n--- Running Test Case 4: Financial Reconciliation ---")
        sample_bank_transactions = [
            {'amount': 1000000, 'date': '2023-10-01', 'ref_id': 'TX1', 'type': 'deposit'}, # Matched
            {'amount': 2500000, 'date': '2023-10-02', 'ref_id': 'TX2', 'type': 'deposit'}, # Unmatched
            {'amount': 500000, 'date': '2023-10-03', 'ref_id': 'TX3', 'type': 'withdrawal'},# Should be ignored
        ]
        sample_tax_invoices = [
            {'amount': 1000000, 'tax_id': 'INV1'},
            {'amount': 5000000, 'tax_id': 'INV2'},
        ]

        financial_alerts = engine.reconcile_transactions(sample_bank_transactions, sample_tax_invoices)

        if financial_alerts:
            print(f"Generated {len(financial_alerts)} financial alert(s):")
            for alert in financial_alerts:
                print("  --- Alert Details ---")
                for key, value in alert.items():
                    if isinstance(value, dict):
                        print(f"    {key}:")
                        for sub_key, sub_value in value.items():
                            print(f"      {sub_key}: {sub_value}")
                    else:
                        print(f"    {key}: {value}")
        else:
            print("No alert generated.")


    except ValueError as e:
        print(f"Engine initialization failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
