using RDD.Domain;
using RDD.Domain.Models;
using RDD.Domain.Models.Querying;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lucca.CSharpSDK.Domain.Models.Organization
{
	public class User : EntityBase<User, int>
	{
		public override int Id { get; set; }
		public override string Name { get; set; }
		public long BudgetInsightBankAccountId { get; set; }
	}
}
