using RDD.Domain;
using RDD.Domain.Models;
using RDD.Domain.Models.Querying;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lucca.CSharpSDK.Domain.Models
{
	public class EntityBase
	{
		public Dictionary<string, bool> Actions { get; set; }
		public ICollection<Operation> Operations { get; set; }
		public void Forge(IStorageService storage, Options queryOptions) { }
	}
}
